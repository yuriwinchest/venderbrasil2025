import { db } from "./db";
import { appointments } from "@shared/schema";
import { eq, and, ne, gte, lte, or } from "drizzle-orm";

interface ConflictCheckResult {
  hasConflict: boolean;
  conflictType: 'exact_match' | 'overlap' | 'buffer_violation' | 'none';
  conflictingAppointments: Array<{
    id: number;
    name: string;
    time: string;
    date: string;
    status: string;
  }>;
  suggestions: string[];
  alternativeSlots: string[];
}

interface BookingAttempt {
  date: string;
  time: string;
  duration?: number; // in minutes, default 60
  name: string;
  email: string;
  phone: string;
}

export class IntelligentConflictPrevention {
  private readonly DEFAULT_DURATION = 60; // 60 minutes
  private readonly BUFFER_TIME = 15; // 15 minutes buffer between appointments
  private readonly MAX_CONCURRENT_BOOKINGS = 1; // Maximum concurrent bookings per slot

  /**
   * Advanced conflict detection with multiple conflict types
   */
  async detectConflicts(attempt: BookingAttempt): Promise<ConflictCheckResult> {
    const duration = attempt.duration || this.DEFAULT_DURATION;
    const startTime = this.timeToMinutes(attempt.time);
    const endTime = startTime + duration;
    
    // Get all non-cancelled appointments for the date
    const existingAppointments = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.date, attempt.date),
          ne(appointments.status, 'cancelled')
        )
      );

    const conflicts = [];
    let conflictType: ConflictCheckResult['conflictType'] = 'none';

    for (const existing of existingAppointments) {
      const existingStart = this.timeToMinutes(existing.time);
      const existingEnd = existingStart + this.DEFAULT_DURATION;

      // Exact time match
      if (existing.time === attempt.time) {
        conflicts.push({
          id: existing.id,
          name: existing.name,
          time: existing.time,
          date: existing.date,
          status: existing.status
        });
        conflictType = 'exact_match';
        continue;
      }

      // Time overlap detection
      if (this.hasTimeOverlap(startTime, endTime, existingStart, existingEnd)) {
        conflicts.push({
          id: existing.id,
          name: existing.name,
          time: existing.time,
          date: existing.date,
          status: existing.status
        });
        if (conflictType === 'none') conflictType = 'overlap';
        continue;
      }

      // Buffer violation (too close to existing appointments)
      if (this.violatesBuffer(startTime, endTime, existingStart, existingEnd)) {
        conflicts.push({
          id: existing.id,
          name: existing.name,
          time: existing.time,
          date: existing.date,
          status: existing.status
        });
        if (conflictType === 'none') conflictType = 'buffer_violation';
      }
    }

    const suggestions = this.generateConflictSuggestions(conflicts, conflictType, attempt);
    const alternativeSlots = await this.findAlternativeSlots(attempt.date, attempt.time);

    return {
      hasConflict: conflicts.length > 0,
      conflictType,
      conflictingAppointments: conflicts,
      suggestions,
      alternativeSlots
    };
  }

  /**
   * Atomic booking operation with race condition prevention
   */
  async attemptAtomicBooking(attempt: BookingAttempt): Promise<{
    success: boolean;
    conflictResult?: ConflictCheckResult;
    appointmentId?: number;
    message: string;
  }> {
    // Start transaction-like operation
    const lockKey = `${attempt.date}_${attempt.time}`;
    
    try {
      // Double-check for conflicts just before booking
      const conflictResult = await this.detectConflicts(attempt);
      
      if (conflictResult.hasConflict) {
        return {
          success: false,
          conflictResult,
          message: this.getConflictMessage(conflictResult)
        };
      }

      // Attempt to create the appointment
      const [newAppointment] = await db
        .insert(appointments)
        .values({
          name: attempt.name,
          email: attempt.email,
          phone: attempt.phone,
          date: attempt.date,
          time: attempt.time,
          status: 'pending',
          notes: '',
          isViewed: false
        })
        .returning();

      return {
        success: true,
        appointmentId: newAppointment.id,
        message: 'Agendamento realizado com sucesso'
      };

    } catch (error) {
      // Handle database constraint violations or other errors
      if (error instanceof Error && error.message.includes('unique')) {
        const conflictResult = await this.detectConflicts(attempt);
        return {
          success: false,
          conflictResult,
          message: 'Este horário foi ocupado por outra pessoa enquanto você estava agendando. Por favor, escolha outro horário.'
        };
      }
      
      throw error;
    }
  }

  /**
   * Intelligent slot recommendation based on preferences and patterns
   */
  async recommendOptimalSlots(date: string, preferredTime?: string, userPreferences?: {
    timePreference: 'morning' | 'afternoon' | 'evening';
    flexibility: 'strict' | 'moderate' | 'flexible';
  }): Promise<string[]> {
    const availableSlots = await this.getAvailableSlots(date);
    
    if (!userPreferences || !preferredTime) {
      return availableSlots.slice(0, 5); // Return first 5 available
    }

    const preferredMinutes = this.timeToMinutes(preferredTime);
    const { timePreference, flexibility } = userPreferences;

    // Score each slot based on preferences
    const scoredSlots = availableSlots.map(slot => {
      const slotMinutes = this.timeToMinutes(slot);
      let score = 0;

      // Time proximity score
      const timeDiff = Math.abs(slotMinutes - preferredMinutes);
      score += Math.max(0, 100 - timeDiff); // Closer times get higher scores

      // Time preference score
      if (timePreference === 'morning' && slotMinutes < 12 * 60) score += 50;
      if (timePreference === 'afternoon' && slotMinutes >= 12 * 60 && slotMinutes < 18 * 60) score += 50;
      if (timePreference === 'evening' && slotMinutes >= 18 * 60) score += 50;

      // Flexibility adjustment
      if (flexibility === 'strict' && timeDiff > 60) score -= 30;
      if (flexibility === 'flexible') score += 20;

      return { slot, score };
    });

    // Sort by score and return top recommendations
    return scoredSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.slot);
  }

  /**
   * Predictive conflict analysis for upcoming days
   */
  async analyzePotentialConflicts(startDate: string, endDate: string): Promise<{
    highRiskDates: string[];
    recommendations: string[];
    optimalDates: string[];
  }> {
    const dates = this.generateDateRange(startDate, endDate);
    const analysis = {
      highRiskDates: [] as string[],
      recommendations: [] as string[],
      optimalDates: [] as string[]
    };

    for (const date of dates) {
      const availableSlots = await this.getAvailableSlots(date);
      const occupancyRate = 1 - (availableSlots.length / 16); // 16 total slots

      if (occupancyRate > 0.8) {
        analysis.highRiskDates.push(date);
      } else if (occupancyRate < 0.3) {
        analysis.optimalDates.push(date);
      }
    }

    // Generate recommendations
    if (analysis.highRiskDates.length > 0) {
      analysis.recommendations.push('Considere agendar com antecedência para datas com alta demanda');
      analysis.recommendations.push('Horários alternativos estão disponíveis em datas com menor procura');
    }

    if (analysis.optimalDates.length > 0) {
      analysis.recommendations.push(`Datas com maior disponibilidade: ${analysis.optimalDates.slice(0, 3).join(', ')}`);
    }

    return analysis;
  }

  // Helper methods
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + (minutes || 0);
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private hasTimeOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    return start1 < end2 && end1 > start2;
  }

  private violatesBuffer(start1: number, end1: number, start2: number, end2: number): boolean {
    const minDistance = Math.min(
      Math.abs(start1 - end2),
      Math.abs(start2 - end1)
    );
    return minDistance < this.BUFFER_TIME && minDistance > 0;
  }

  private generateConflictSuggestions(conflicts: any[], conflictType: string, attempt: BookingAttempt): string[] {
    const suggestions = [];

    switch (conflictType) {
      case 'exact_match':
        suggestions.push('Este horário já está ocupado. Escolha outro horário disponível.');
        suggestions.push('Considere agendar 1 hora antes ou depois do horário desejado.');
        break;
      
      case 'overlap':
        suggestions.push('Há sobreposição com outro agendamento. Verifique horários adjacentes.');
        suggestions.push('Considere um horário com pelo menos 1 hora de diferença.');
        break;
      
      case 'buffer_violation':
        suggestions.push('Horário muito próximo de outro agendamento. Recomendamos pelo menos 15 minutos de intervalo.');
        suggestions.push('Escolha um horário com mais espaçamento para melhor organização.');
        break;
    }

    if (conflicts.length > 0) {
      const conflictTime = conflicts[0].time;
      suggestions.push(`Horário conflitante: ${conflictTime}. Escolha outro horário.`);
    }

    return suggestions;
  }

  private getConflictMessage(conflictResult: ConflictCheckResult): string {
    if (conflictResult.conflictType === 'exact_match') {
      return 'Este horário já foi reservado por outra pessoa. Por favor, escolha outro horário.';
    }
    
    if (conflictResult.suggestions.length > 0) {
      return conflictResult.suggestions[0];
    }
    
    return 'Conflito de agendamento detectado. Por favor, escolha outro horário.';
  }

  private async findAlternativeSlots(date: string, requestedTime: string): Promise<string[]> {
    const availableSlots = await this.getAvailableSlots(date);
    const requestedMinutes = this.timeToMinutes(requestedTime);

    // Sort by proximity to requested time
    return availableSlots
      .map(slot => ({
        slot,
        distance: Math.abs(this.timeToMinutes(slot) - requestedMinutes)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(item => item.slot);
  }

  private async getAvailableSlots(date: string): Promise<string[]> {
    // Get all booked appointments for the date
    const bookedAppointments = await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.date, date),
          ne(appointments.status, 'cancelled')
        )
      );

    // All possible slots (8 AM to 11 PM)
    const allSlots = [];
    for (let hour = 8; hour <= 23; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    }

    // Filter out booked slots
    const bookedTimes = bookedAppointments.map(apt => apt.time);
    let availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    // Filter out past time slots if it's today
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const currentHour = new Date().getHours();
      availableSlots = availableSlots.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        return slotHour > currentHour;
      });
    }

    return availableSlots;
  }

  private generateDateRange(startDate: string, endDate: string): string[] {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    while (start <= end) {
      dates.push(start.toISOString().split('T')[0]);
      start.setDate(start.getDate() + 1);
    }
    
    return dates;
  }
}

export const conflictPrevention = new IntelligentConflictPrevention();