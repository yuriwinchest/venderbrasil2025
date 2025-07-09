import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, Calendar, MessageCircle, Phone, Edit, Trash2, Eye, 
  Plus, Clock, DollarSign, TrendingUp, ArrowLeft, CheckCircle,
  AlertCircle, Building, FileText, Activity, Settings
} from "lucide-react";
import { EmojiReactionSystem } from "@/components/interactive-features/EmojiReactionSystem";
import { Link } from "wouter";
import { useLeads } from "@/hooks/use-leads";
import { BackToHomeButton } from "@/components/ui/back-to-home-button";
import { useAppointments } from "@/hooks/use-appointments";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schemas for forms
const leadNoteSchema = z.object({
  content: z.string().min(1, "Conteúdo da nota é obrigatório"),
});

const projectSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  description: z.string().optional(),
  budget: z.coerce.number().positive("Orçamento deve ser positivo"),
  deadline: z.string().optional(),
  status: z.string().default("em-andamento")
});

const platformCostSchema = z.object({
  platform: z.string().min(1, "Nome da plataforma é obrigatório"),
  cost: z.coerce.number().positive("Valor deve ser positivo"),
  month_year: z.string().min(1, "Mês/Ano é obrigatório"),
  description: z.string().optional()
});

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  
  // State management
  const [activeTab, setActiveTab] = useState("leads");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeadNotes, setSelectedLeadNotes] = useState<any[]>([]);
  const [selectedLeadProjects, setSelectedLeadProjects] = useState<any[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreatePlatformCost, setShowCreatePlatformCost] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  
  // Força atualização quando muda para aba de agendamentos
  useEffect(() => {
    if (activeTab === 'appointments') {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/new-count'] });
    }
  }, [activeTab, queryClient]);

  // Data queries
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      return response.json();
    }
  });

  const { data: platformCosts = [] } = useQuery({
    queryKey: ['/api/platform-costs'],
    queryFn: async () => {
      const response = await fetch('/api/platform-costs');
      return response.json();
    }
  });

  const { data: newAppointmentsCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ['/api/appointments/new-count'],
    refetchInterval: 2000, // Atualiza a cada 2 segundos
    staleTime: 1000, // Considera dados obsoletos após 1 segundo
  });

  // Forms
  const noteForm = useForm({
    resolver: zodResolver(leadNoteSchema),
    defaultValues: { content: "" }
  });

  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      budget: 0,
      deadline: "",
      status: "em-andamento"
    }
  });

  const platformCostForm = useForm({
    resolver: zodResolver(platformCostSchema),
    defaultValues: {
      platform: "",
      cost: 0,
      month_year: "",
      description: ""
    }
  });

  // Mutations
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/leads/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({ title: "Status do lead atualizado com sucesso!" });
    }
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/appointments/${id}`, { status });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      
      // Se o status for finalizado (realizado, não compareceu, cancelado), liberar o horário automaticamente
      const finalizingStatuses = ['completed', 'no-show', 'cancelled'];
      if (finalizingStatuses.includes(variables.status)) {
        // Deletar o agendamento para liberar o horário
        deleteAppointmentMutation.mutate(variables.id);
        toast({ 
          title: "Status atualizado e horário liberado!", 
          description: "O horário agora está disponível para novas reservas." 
        });
      } else {
        toast({ title: "Status do agendamento atualizado com sucesso!" });
      }
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/new-count'] });
      toast({ title: "Horário liberado com sucesso!" });
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/projects', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setShowCreateProject(false);
      projectForm.reset();
      toast({ title: "Projeto criado com sucesso!" });
    }
  });

  const createPlatformCostMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/platform-costs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform-costs'] });
      setShowCreatePlatformCost(false);
      platformCostForm.reset();
      toast({ title: "Pagamento registrado com sucesso!" });
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/lead-notes', { ...data, leadId: selectedLead?.id });
    },
    onSuccess: () => {
      if (selectedLead) {
        openLeadDetails(selectedLead);
      }
      setShowAddNote(false);
      noteForm.reset();
      toast({ title: "Nota adicionada com sucesso!" });
    }
  });

  // Mutation para atualizar status do projeto
  const updateProjectStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/projects/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: "Status do projeto atualizado com sucesso!" });
    }
  });

  // Helper functions
  const openLeadDetails = async (lead: any) => {
    setSelectedLead(lead);
    
    try {
      const [notesResponse, projectsResponse] = await Promise.all([
        fetch(`/api/lead-notes/${lead.id}`),
        fetch(`/api/projects?leadId=${lead.id}`)
      ]);
      
      const notes = await notesResponse.json();
      const projects = await projectsResponse.json();
      
      setSelectedLeadNotes(notes);
      setSelectedLeadProjects(projects);
    } catch (error) {
      console.error('Error fetching lead details:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'new': 'bg-blue-100 text-blue-800',
      'novo': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'contatado': 'bg-yellow-100 text-yellow-800',
      'negotiating': 'bg-orange-100 text-orange-800',
      'negociando': 'bg-orange-100 text-orange-800',
      'closed': 'bg-green-100 text-green-800',
      'fechado': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'cancelado': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'completed': 'bg-purple-100 text-purple-800',
      'no-show': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Filter data
  const filteredLeads = leads.filter(lead => 
    statusFilter === "all" || lead.status === statusFilter
  );

  // Calculate stats
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter((l: any) => l.status === 'new' || l.status === 'novo').length,
    activeProjects: projects.filter((p: any) => p.status === 'em-andamento').length,
    totalAppointments: appointments.length,
    newAppointments: newAppointmentsCount.count,
    totalRevenue: projects.reduce((sum: number, p: any) => sum + (p.value || 0), 0),
    totalCosts: platformCosts.reduce((sum: number, c: any) => sum + c.cost, 0)
  };

  if (leadsLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botão Voltar ao Início */}
      <BackToHomeButton />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Site
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
                <p className="text-gray-600">Gerencie leads, agendamentos, projetos e custos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total de Leads</p>
                  <h3 className="text-2xl font-bold">{stats.totalLeads}</h3>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Agendamentos</p>
                  <h3 className="text-2xl font-bold">{stats.totalAppointments}</h3>
                </div>
                <Calendar className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Projetos Ativos</p>
                  <h3 className="text-2xl font-bold">{stats.activeProjects}</h3>
                </div>
                <Building className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Receita Total</p>
                  <h3 className="text-2xl font-bold">
                    R$ {(() => {
                      const total = projects.reduce((sum: number, project: any) => {
                        const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : (project.budget || 0);
                        return sum + budget;
                      }, 0);
                      return total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    })()}
                  </h3>
                </div>
                <DollarSign className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row - Platform Costs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100">Gastos 99Freelas</p>
                  <h3 className="text-2xl font-bold">
                    R$ {(() => {
                      const total = platformCosts.reduce((sum: number, cost: any) => {
                        const costValue = typeof cost.cost === 'string' ? parseFloat(cost.cost) : (cost.cost || 0);
                        return sum + costValue;
                      }, 0);
                      return total.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    })()}
                  </h3>
                  <p className="text-red-200 text-sm">Jan-Jun 2025</p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-200 rotate-180" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100">Lucro Líquido</p>
                  <h3 className="text-2xl font-bold">
                    R$ {(() => {
                      const totalRevenue = projects.reduce((sum: number, project: any) => {
                        const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : (project.budget || 0);
                        return sum + budget;
                      }, 0);
                      const totalCosts = platformCosts.reduce((sum: number, cost: any) => {
                        const costValue = typeof cost.cost === 'string' ? parseFloat(cost.cost) : (cost.cost || 0);
                        return sum + costValue;
                      }, 0);
                      const profit = totalRevenue - totalCosts;
                      return profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    })()}
                  </h3>
                  <p className="text-emerald-200 text-sm">Receita - Custos</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">ROI %</p>
                  <h3 className="text-2xl font-bold">
                    {(() => {
                      const totalRevenue = projects.reduce((sum: number, project: any) => {
                        const budget = typeof project.budget === 'string' ? parseFloat(project.budget) : (project.budget || 0);
                        return sum + budget;
                      }, 0);
                      const totalCosts = platformCosts.reduce((sum: number, cost: any) => {
                        const costValue = typeof cost.cost === 'string' ? parseFloat(cost.cost) : (cost.cost || 0);
                        return sum + costValue;
                      }, 0);
                      
                      if (totalCosts > 0) {
                        const roi = ((totalRevenue - totalCosts) / totalCosts) * 100;
                        return `${roi.toFixed(1)}%`;
                      }
                      return '0%';
                    })()}
                  </h3>
                  <p className="text-indigo-200 text-sm">Return on Investment</p>
                </div>
                <Activity className="h-8 w-8 text-indigo-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={() => setActiveTab("leads")}
            className={`${activeTab === "leads" ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gradient-to-r from-blue-500 to-blue-600"} text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all`}
          >
            <Users className="h-5 w-5 mr-3" />
            Gerenciar Leads
          </Button>
          
          <Button 
            onClick={() => setActiveTab("appointments")}
            className={`${activeTab === "appointments" ? "bg-gradient-to-r from-green-600 to-green-700" : "bg-gradient-to-r from-green-500 to-green-600"} text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all`}
          >
            <Calendar className="h-5 w-5 mr-3" />
            Agendamentos
          </Button>
          
          <Button 
            onClick={() => setActiveTab("projects")}
            className={`${activeTab === "projects" ? "bg-gradient-to-r from-purple-600 to-purple-700" : "bg-gradient-to-r from-purple-500 to-purple-600"} text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all`}
          >
            <Building className="h-5 w-5 mr-3" />
            Projetos
          </Button>
          
          <Button 
            onClick={() => setActiveTab("costs")}
            className={`${activeTab === "costs" ? "bg-gradient-to-r from-orange-600 to-orange-700" : "bg-gradient-to-r from-orange-500 to-orange-600"} text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all`}
          >
            <Settings className="h-5 w-5 mr-3" />
            Custos da Plataforma
          </Button>
        </div>

        {/* Additional Navigation Buttons Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button 
            onClick={() => setActiveTab("analytics")}
            className={`${activeTab === "analytics" ? "bg-gradient-to-r from-indigo-600 to-indigo-700" : "bg-gradient-to-r from-indigo-500 to-indigo-600"} text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all`}
          >
            <TrendingUp className="h-5 w-5 mr-3" />
            99Freelas Analytics
          </Button>
          
          <Button 
            onClick={() => setActiveTab("roi-analysis")}
            className={`${activeTab === "roi-analysis" ? "bg-gradient-to-r from-emerald-600 to-emerald-700" : "bg-gradient-to-r from-emerald-500 to-emerald-600"} text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all`}
          >
            <DollarSign className="h-5 w-5 mr-3" />
            Análise ROI
          </Button>
          
          <Button 
            onClick={() => window.open('/data-analyzer', '_blank')}
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <FileText className="h-5 w-5 mr-3" />
            Data Analyzer
          </Button>
          
          <Button 
            onClick={() => window.open('/marketplace-tools', '_blank')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <Activity className="h-5 w-5 mr-3" />
            Marketplace Tools
          </Button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Leads Tab */}
          {activeTab === "leads" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Gerenciar Leads
                  </CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="contacted">Contatado</SelectItem>
                      <SelectItem value="negotiating">Negociando</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredLeads.map((lead) => {
                    const leadInitial = lead.name.charAt(0).toUpperCase();
                    const avatarColors = [
                      'bg-gradient-to-br from-blue-500 to-purple-600',
                      'bg-gradient-to-br from-green-500 to-teal-600', 
                      'bg-gradient-to-br from-orange-500 to-red-600',
                      'bg-gradient-to-br from-pink-500 to-rose-600',
                      'bg-gradient-to-br from-indigo-500 to-blue-600',
                      'bg-gradient-to-br from-yellow-500 to-orange-600'
                    ];
                    const avatarColor = avatarColors[lead.id % avatarColors.length];
                    
                    const statusConfig = {
                      'new': { emoji: '🆕', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      'novo': { emoji: '🆕', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      'contacted': { emoji: '📞', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                      'contatado': { emoji: '📞', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                      'negotiating': { emoji: '🤝', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                      'negociando': { emoji: '🤝', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                      'closed': { emoji: '✅', color: 'bg-green-100 text-green-800 border-green-200' },
                      'fechado': { emoji: '✅', color: 'bg-green-100 text-green-800 border-green-200' },
                      'cancelled': { emoji: '❌', color: 'bg-red-100 text-red-800 border-red-200' },
                      'cancelado': { emoji: '❌', color: 'bg-red-100 text-red-800 border-red-200' }
                    };
                    
                    const status = statusConfig[lead.status as keyof typeof statusConfig] || 
                      { emoji: '📋', color: 'bg-gray-100 text-gray-800 border-gray-200' };

                    return (
                      <div key={lead.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {leadInitial}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {lead.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {lead.email}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {lead.whatsapp}
                                </p>
                              </div>
                              
                              {/* Status Badge */}
                              <Badge className={`${status.color} border font-medium px-3 py-1`}>
                                <span className="mr-1">{status.emoji}</span>
                                {lead.status}
                              </Badge>
                            </div>
                            
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Serviço</p>
                                <p className="text-sm text-gray-900 mt-1">{lead.serviceType}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data</p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valor Estimado</p>
                                <p className="text-sm text-gray-900 mt-1 font-semibold">
                                  R$ {lead.budget ? parseInt(lead.budget).toLocaleString('pt-BR') : '2.500'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openLeadDetails(lead)}
                                className="flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Detalhes
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja deletar o lead "${lead.name}"?`)) {
                                    fetch(`/api/leads/${lead.id}`, {
                                      method: 'DELETE'
                                    }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                                      toast({ title: "Lead deletado com sucesso!" });
                                    }).catch(() => {
                                      toast({ 
                                        title: "Erro ao deletar lead", 
                                        description: "Tente novamente mais tarde",
                                        variant: "destructive" 
                                      });
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deletar
                              </Button>
                              
                              <Select
                                value={lead.status}
                                onValueChange={(value) => 
                                  updateLeadStatusMutation.mutate({ id: lead.id, status: value })
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">🆕 Novo</SelectItem>
                                  <SelectItem value="contacted">📞 Contatado</SelectItem>
                                  <SelectItem value="negotiating">🤝 Negociando</SelectItem>
                                  <SelectItem value="closed">✅ Fechado</SelectItem>
                                  <SelectItem value="cancelled">❌ Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-8 w-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Gerenciar Agendamentos</h2>
                      <p className="text-green-100 mt-1">
                        Controle total dos horários e reuniões
                        {appointmentsLoading && (
                          <span className="ml-2 text-xs">(Atualizando...)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {newAppointmentsCount.count > 0 && (
                    <Badge className="bg-yellow-500 text-yellow-900 px-4 py-2 text-sm font-bold animate-pulse">
                      🔔 {newAppointmentsCount.count} novos agendamentos
                    </Badge>
                  )}
                </div>
              </div>

              {/* Modern Cards Layout */}
              <div className="grid gap-4">
                {appointments.map((appointment) => {
                  // Verifica se é um agendamento novo (criado nos últimos 5 minutos)
                  const isNew = appointment.createdAt && 
                    new Date(appointment.createdAt).getTime() > Date.now() - 5 * 60 * 1000;
                  
                  return (
                    <Card 
                      key={appointment.id} 
                      className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                        isNew ? 'border-l-yellow-500 ring-2 ring-yellow-300 animate-pulse' : 'border-l-green-500'
                      }`}
                    >
                      <CardContent className="p-6">
                        {isNew && (
                          <Badge className="mb-2 bg-yellow-100 text-yellow-800 font-bold">
                            🆕 Novo Agendamento!
                          </Badge>
                        )}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                        
                        {/* Client Info */}
                        <div className="md:col-span-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {appointment.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{appointment.name}</h3>
                              <p className="text-sm text-gray-600">{appointment.email}</p>
                              <p className="text-sm text-gray-500">{appointment.phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div className="text-center">
                          <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg p-3">
                            <div className="flex items-center justify-center mb-1">
                              <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                              <span className="text-sm font-medium text-blue-800">Data</span>
                            </div>
                            <p className="font-bold text-blue-900">
                              {(() => {
                                // Corrige o problema de timezone ao interpretar a data
                                const [year, month, day] = appointment.date.split('-').map(Number);
                                const correctedDate = new Date(year, month - 1, day);
                                return correctedDate.toLocaleDateString('pt-BR');
                              })()}
                            </p>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-center mb-1">
                              <Clock className="h-4 w-4 text-purple-600 mr-1" />
                              <span className="text-sm font-medium text-purple-800">Horário</span>
                            </div>
                            <p className="font-bold text-purple-900 text-lg">{appointment.time}</p>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="text-center">
                          <Badge className={`px-4 py-2 text-sm font-bold ${getStatusColor(appointment.status)}`}>
                            {appointment.status === 'pending' && '⏳ Pendente'}
                            {appointment.status === 'confirmed' && '✅ Confirmado'}
                            {appointment.status === 'completed' && '✅ Realizado'}
                            {appointment.status === 'no-show' && '❌ Não compareceu'}
                            {appointment.status === 'cancelled' && '🚫 Cancelado'}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2">
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => 
                              updateAppointmentStatusMutation.mutate({ 
                                id: appointment.id, 
                                status: value 
                              })
                            }
                          >
                            <SelectTrigger className="w-full bg-gray-50 border-2 border-gray-200 hover:border-gray-300 rounded-lg">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">⏳ Pendente</SelectItem>
                              <SelectItem value="confirmed">✅ Confirmado</SelectItem>
                              <SelectItem value="completed">✅ Realizado</SelectItem>
                              <SelectItem value="no-show">❌ Não compareceu</SelectItem>
                              <SelectItem value="cancelled">🚫 Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                            title="Liberar horário permanentemente"
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Liberar Horário
                          </Button>
                          
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              // Remove caracteres especiais do número e adiciona código do Brasil
                              const cleanPhone = appointment.phone.replace(/\D/g, '');
                              const whatsappNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
                              window.open(`https://wa.me/${whatsappNumber}`, '_blank');
                            }}
                            title="Enviar mensagem no WhatsApp"
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
                
                {appointments.length === 0 && (
                  <Card className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100">
                    <CardContent>
                      <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum agendamento encontrado</h3>
                      <p className="text-gray-500">Quando houver novos agendamentos, eles aparecerão aqui.</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Total</h4>
                    <p className="text-2xl font-bold">{appointments.length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Pendentes</h4>
                    <p className="text-2xl font-bold">
                      {appointments.filter(a => a.status === 'pending').length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Confirmados</h4>
                    <p className="text-2xl font-bold">
                      {appointments.filter(a => a.status === 'confirmed').length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Realizados</h4>
                    <p className="text-2xl font-bold">
                      {appointments.filter(a => a.status === 'completed').length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Gerenciar Projetos
                  </CardTitle>
                  <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Projeto
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Criar Novo Projeto</DialogTitle>
                      </DialogHeader>
                      <Form {...projectForm}>
                        <form onSubmit={projectForm.handleSubmit((data) => createProjectMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={projectForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Projeto</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="budget"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Orçamento (R$)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={projectForm.control}
                            name="deadline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prazo</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Criar Projeto
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {projects.map((project: any) => {
                    const projectInitial = project.name.charAt(0).toUpperCase();
                    const avatarColors = [
                      'bg-gradient-to-br from-emerald-500 to-teal-600',
                      'bg-gradient-to-br from-blue-500 to-indigo-600', 
                      'bg-gradient-to-br from-purple-500 to-pink-600',
                      'bg-gradient-to-br from-orange-500 to-amber-600',
                      'bg-gradient-to-br from-rose-500 to-red-600',
                      'bg-gradient-to-br from-cyan-500 to-blue-600'
                    ];
                    const avatarColor = avatarColors[project.id % avatarColors.length];
                    
                    const statusConfig = {
                      'em-andamento': { emoji: '🚀', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      'concluido': { emoji: '✅', color: 'bg-green-100 text-green-800 border-green-200' },
                      'pausado': { emoji: '⏸️', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                      'cancelado': { emoji: '❌', color: 'bg-red-100 text-red-800 border-red-200' },
                      'planejamento': { emoji: '📋', color: 'bg-gray-100 text-gray-800 border-gray-200' }
                    };
                    
                    const status = statusConfig[project.status as keyof typeof statusConfig] || 
                      { emoji: '📄', color: 'bg-gray-100 text-gray-800 border-gray-200' };

                    const progressPercentage = project.status === 'concluido' ? 100 : 
                      project.status === 'em-andamento' ? Math.floor(Math.random() * 60 + 30) :
                      project.status === 'pausado' ? Math.floor(Math.random() * 40 + 20) : 10;

                    return (
                      <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <div className={`w-12 h-12 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {projectInitial}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                  {project.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                  {project.description || "Projeto em desenvolvimento"}
                                </p>
                              </div>
                              
                              {/* Status Badge */}
                              <Badge className={`${status.color} border font-medium px-3 py-1`}>
                                <span className="mr-1">{status.emoji}</span>
                                {project.status || 'em-andamento'}
                              </Badge>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Progresso</span>
                                <span className="text-sm font-bold text-gray-700">{progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    progressPercentage === 100 ? 'bg-green-500' :
                                    progressPercentage >= 70 ? 'bg-blue-500' :
                                    progressPercentage >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                                  }`}
                                  style={{width: `${progressPercentage}%`}}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Orçamento</p>
                                <p className="text-sm text-gray-900 mt-1 font-semibold">
                                  R$ {project.budget ? project.budget.toLocaleString('pt-BR') : '2.500'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prazo</p>
                                <p className="text-sm text-gray-900 mt-1">
                                  {project.deadline ? new Date(project.deadline).toLocaleDateString('pt-BR') : 'A definir'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</p>
                                <p className="text-sm text-gray-900 mt-1">
                                  Lead #{project.leadId || 'N/A'}
                                </p>
                              </div>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-3 mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja deletar o projeto "${project.name}"?`)) {
                                    // Criar mutation para deletar projeto
                                    fetch(`/api/projects/${project.id}`, {
                                      method: 'DELETE'
                                    }).then(() => {
                                      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
                                      toast({ title: "Projeto deletado com sucesso!" });
                                    }).catch(() => {
                                      toast({ 
                                        title: "Erro ao deletar projeto", 
                                        description: "Tente novamente mais tarde",
                                        variant: "destructive" 
                                      });
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deletar
                              </Button>
                              
                              <Select
                                value={project.status || 'em-andamento'}
                                onValueChange={(value) => {
                                  updateProjectStatusMutation.mutate({ id: project.id, status: value });
                                }}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="planejamento">📋 Planejamento</SelectItem>
                                  <SelectItem value="em-andamento">🚀 Em Andamento</SelectItem>
                                  <SelectItem value="pausado">⏸️ Pausado</SelectItem>
                                  <SelectItem value="concluido">✅ Concluído</SelectItem>
                                  <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {projects.length === 0 && (
                  <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-gray-500">Crie um novo projeto para começar.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center">
                  <TrendingUp className="mr-3 h-8 w-8" />
                  <h2 className="text-2xl font-bold">99Freelas Analytics</h2>
                </div>
                <p className="mt-2 text-indigo-100">Métricas e análises de performance da plataforma</p>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Propostas Enviadas</p>
                        <h3 className="text-3xl font-bold">127</h3>
                        <p className="text-sm text-blue-200 mt-1">+15% este mês</p>
                      </div>
                      <FileText className="h-12 w-12 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Taxa de Conversão</p>
                        <h3 className="text-3xl font-bold">24%</h3>
                        <p className="text-sm text-green-200 mt-1">+8% este mês</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Receita Mensal</p>
                        <h3 className="text-3xl font-bold">R$ 12.400</h3>
                        <p className="text-sm text-purple-200 mt-1">+22% este mês</p>
                      </div>
                      <DollarSign className="h-12 w-12 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Projetos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Desenvolvimento Web</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                          <span className="text-sm font-medium">75%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Design Gráfico</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '45%'}}></div>
                          </div>
                          <span className="text-sm font-medium">45%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Marketing Digital</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '30%'}}></div>
                          </div>
                          <span className="text-sm font-medium">30%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Propostas Aceitas:</span>
                        <span className="font-bold text-green-600">31</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Projetos Concluídos:</span>
                        <span className="font-bold text-blue-600">28</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avaliação Média:</span>
                        <span className="font-bold text-yellow-600">4.8⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxa de Recontratação:</span>
                        <span className="font-bold text-purple-600">67%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Platform Costs Tab */}
          {activeTab === "costs" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Settings className="mr-3 h-8 w-8" />
                    <h2 className="text-2xl font-bold">Gerenciar Custos da Plataforma</h2>
                  </div>
                  <Dialog open={showCreatePlatformCost} onOpenChange={setShowCreatePlatformCost}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-purple-600 hover:bg-gray-100 font-medium px-6 py-2 rounded-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Registrar Pagamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Registrar Novo Pagamento</DialogTitle>
                      </DialogHeader>
                      <Form {...platformCostForm}>
                        <form onSubmit={platformCostForm.handleSubmit((data) => createPlatformCostMutation.mutate(data))} className="space-y-4">
                          <FormField
                            control={platformCostForm.control}
                            name="platform"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Plataforma</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ex: 99Freelas, Workana, GetNinjas" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={platformCostForm.control}
                            name="cost"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Valor (R$)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={platformCostForm.control}
                            name="month_year"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mês/Ano</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="ex: Junho 2025" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={platformCostForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                  <Textarea {...field} placeholder="Assinatura mensal, taxa adicional, etc." />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                            Registrar Pagamento
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Platform Costs List */}
              <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {platformCosts.map((cost: any) => (
                    <div key={cost.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{cost.platform}</h4>
                          <div className="text-right">
                            <div className="text-xl font-bold text-red-600">
                              R$ {cost.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="flex items-center justify-end mt-1">
                              <Button 
                                size="sm" 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-full text-xs"
                              >
                                Pago
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          Pagamento em: {cost.createdAt ? new Date(cost.createdAt).toLocaleDateString('pt-BR') : cost.month_year}
                        </div>
                        {cost.description && (
                          <div className="mt-1 text-sm text-gray-500">
                            {cost.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {platformCosts.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento registrado</h3>
                      <p className="text-gray-500 mb-4">Registre seus pagamentos de plataformas para acompanhar os custos.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ROI Analysis Tab */}
          {activeTab === "roi-analysis" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="mr-3 h-8 w-8" />
                    <div>
                      <h2 className="text-2xl font-bold">Análise de ROI - 99Freelas</h2>
                      <p className="text-green-100 mt-1">Comparação de gastos versus ganhos reais</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">R$ {(() => {
                      const totalCosts = platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0);
                      const totalRevenue = projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0);
                      const roi = totalRevenue - totalCosts;
                      return roi > 0 ? `+${roi.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : roi.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    })()}</div>
                    <div className="text-green-100 text-sm">ROI Total</div>
                  </div>
                </div>
              </div>

              {/* Main ROI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Costs */}
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <TrendingUp className="h-12 w-12 mx-auto rotate-180" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-1">Gastos Totais</h3>
                    <div className="text-3xl font-bold text-red-600">
                      R$ {platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-red-600 text-sm mt-2">
                      {platformCosts.length} transações
                    </p>
                  </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-green-600 mb-2">
                      <TrendingUp className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">Receita Total</h3>
                    <div className="text-3xl font-bold text-green-600">
                      R$ {projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-green-600 text-sm mt-2">
                      {projects.length} projetos
                    </p>
                  </CardContent>
                </Card>

                {/* ROI Percentage */}
                <Card className={`bg-gradient-to-br ${
                  ((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100 > 0
                    ? 'from-blue-50 to-blue-100 border-blue-200'
                    : 'from-orange-50 to-orange-100 border-orange-200'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`${
                      ((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100 > 0
                        ? 'text-blue-600'
                        : 'text-orange-600'
                    } mb-2`}>
                      <CheckCircle className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className={`text-lg font-semibold ${
                      ((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100 > 0
                        ? 'text-blue-800'
                        : 'text-orange-800'
                    } mb-1`}>ROI %</h3>
                    <div className={`text-3xl font-bold ${
                      ((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100 > 0
                        ? 'text-blue-600'
                        : 'text-orange-600'
                    }`}>
                      {platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0) > 0 
                        ? `${(((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </div>
                    <p className={`${
                      ((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100 > 0
                        ? 'text-blue-600'
                        : 'text-orange-600'
                    } text-sm mt-2`}>
                      {((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) * 100 > 0
                        ? 'Lucro positivo'
                        : 'Necessita otimização'
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Cost Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Custos por Mês - 99Freelas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(() => {
                        const monthlyData = platformCosts.reduce((acc: any, cost: any) => {
                          const month = cost.monthYear || cost.createdAt?.substring(0, 7) || '2025-01';
                          if (!acc[month]) acc[month] = { total: 0, items: [] };
                          acc[month].total += cost.cost;
                          acc[month].items.push(cost);
                          return acc;
                        }, {});
                        
                        return Object.entries(monthlyData)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .map(([month, data]: [string, any]) => (
                            <div key={month} className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-gray-900">
                                  {new Date(month + '-01').toLocaleDateString('pt-BR', { 
                                    year: 'numeric', 
                                    month: 'long' 
                                  })}
                                </h4>
                                <span className="text-lg font-bold text-red-600">
                                  R$ {data.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {data.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between">
                                    <span>{item.description}</span>
                                    <span>R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Receita por Projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.map((project: any) => (
                        <div key={project.id} className="bg-green-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {project.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Status: {project.status || 'em-andamento'}
                              </p>
                            </div>
                            <span className="text-lg font-bold text-green-600 ml-4">
                              R$ {(project.budget || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      ))}
                      
                      {projects.length === 0 && (
                        <div className="text-center py-8">
                          <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500">Nenhum projeto com receita registrada ainda.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Custo Médio/Mês</h4>
                    <p className="text-2xl font-bold">
                      R$ {(platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0) / 6).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Receita Média/Projeto</h4>
                    <p className="text-2xl font-bold">
                      R$ {projects.length > 0 
                        ? (projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) / projects.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                        : '0,00'
                      }
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Break-even</h4>
                    <p className="text-2xl font-bold">
                      {projects.length > 0 
                        ? Math.ceil(platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0) / (projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) / projects.length))
                        : 0
                      } projetos
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-rose-500 to-rose-600 text-white">
                  <CardContent className="p-4 text-center">
                    <h4 className="font-bold">Margem de Lucro</h4>
                    <p className="text-2xl font-bold">
                      {projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) > 0
                        ? `${(((projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0) - platformCosts.reduce((sum: number, cost: any) => sum + cost.cost, 0)) / projects.reduce((sum: number, project: any) => sum + (project.budget || 0), 0)) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes do Lead: {selectedLead.name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Informações do Lead</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Nome:</span>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">WhatsApp:</span>
                    <p className="font-medium">{selectedLead.whatsapp}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tipo de Serviço:</span>
                    <p className="font-medium">{selectedLead.serviceType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedLead.status)}>
                      {selectedLead.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">Notas do Lead</h4>
                    <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Nota
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Nova Nota</DialogTitle>
                        </DialogHeader>
                        <Form {...noteForm}>
                          <form onSubmit={noteForm.handleSubmit((data) => addNoteMutation.mutate(data))} className="space-y-4">
                            <FormField
                              control={noteForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Conteúdo da Nota</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} placeholder="Digite sua nota aqui..." />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit" className="w-full">
                              Adicionar Nota
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedLeadNotes.map((note: any) => (
                      <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{note.content}</p>
                        <span className="text-xs text-gray-500">
                          {new Date(note.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                    {selectedLeadNotes.length === 0 && (
                      <p className="text-gray-500 text-sm">Nenhuma nota adicionada ainda.</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Projetos Relacionados</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {selectedLeadProjects.map((project: any) => (
                    <div key={project.id} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">
                          R$ {project.budget?.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {selectedLeadProjects.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum projeto relacionado encontrado.</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}