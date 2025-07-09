import twilio from 'twilio';

// Initialize Twilio client with environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn('Twilio credentials not found in environment variables');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export async function sendWhatsAppNotification(to: string, message: string) {
  if (!client) {
    console.warn('Cannot send WhatsApp notification: Twilio client not configured');
    return;
  }
  
  const twilioNumber = process.env.TWILIO_PHONE_NUMBER || '+14155238886';
  
  if (!accountSid || !authToken || !twilioNumber) {
    console.log('Twilio credentials not configured, skipping WhatsApp notification');
    return;
  }

  try {
    const response = await client.messages.create({
      from: `whatsapp:${twilioNumber}`,
      to: `whatsapp:${to}`,
      body: message
    });
    
    console.log('WhatsApp message sent successfully:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

export function formatLeadNotification(lead: any) {
  return `🚀 *Novo Lead Recebido!*

👤 *Nome:* ${lead.name}
📧 *Email:* ${lead.email}
📱 *Telefone:* ${lead.phone}
💼 *Empresa:* ${lead.company || 'Não informado'}
🎯 *Interesse:* ${lead.projectType}
💰 *Orçamento:* ${lead.budget}

📝 *Mensagem:*
${lead.message || 'Nenhuma mensagem adicional'}

⏰ *Recebido em:* ${new Date().toLocaleString('pt-BR')}

Acesse o painel admin para mais detalhes!`;
}

export function formatAppointmentNotification(appointment: any) {
  return `📅 *Novo Agendamento!*

👤 *Nome:* ${appointment.name}
📧 *Email:* ${appointment.email}
📱 *Telefone:* ${appointment.phone}

📅 *Data:* ${new Date(appointment.date).toLocaleDateString('pt-BR')}
🕐 *Horário:* ${appointment.time}

📝 *Observações:*
${appointment.notes || 'Nenhuma observação'}

⏰ *Agendado em:* ${new Date().toLocaleString('pt-BR')}

Prepare-se para a reunião!`;
}