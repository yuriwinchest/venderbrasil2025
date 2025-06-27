import { useState, useEffect } from "react";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Phone, 
  Edit, 
  ArrowLeft, 
  Trash2,
  Plus,
  Eye,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Settings,
  FileText,
  BarChart3,
  TrendingDown,
  ArrowUp,
  FolderOpen,
  Code,
  Brain,
  Shield,
  Trophy,
  Database,
  BarChart,
  Folder,
  CheckCircle2,
  Star,
  ExternalLink,
  Download
} from "lucide-react";
import { Link } from "wouter";
import { useLeads } from "@/hooks/use-leads";
import { useAppointments } from "@/hooks/use-appointments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ProjectComplexityAnalyzer } from "@/components/project-complexity-analyzer";

const noteSchema = z.object({
  note: z.string().min(1, "A anotação não pode estar vazia"),
  type: z.string().default("general")
});

const projectSchema = z.object({
  name: z.string().min(1, "Nome do projeto é obrigatório"),
  description: z.string().optional(),
  leadId: z.number().optional(),
  status: z.string().default("planning"),
  budget: z.union([z.string(), z.number()]).refine((val) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.')) : val;
    return !isNaN(num) && num > 0;
  }, "Valor deve ser um número positivo"),
  amountReceived: z.union([z.string(), z.number()]).refine((val) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.')) : val;
    return !isNaN(num) && num >= 0;
  }, "Valor recebido deve ser um número válido").default("0"),
  amountPending: z.union([z.string(), z.number()]).refine((val) => {
    const num = typeof val === 'string' ? parseFloat(val.replace(/[^\d.,]/g, '').replace(',', '.')) : val;
    return !isNaN(num) && num >= 0;
  }, "Valor pendente deve ser um número válido").default("0"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().default(0),
  source: z.string().default("direto"),
  sourceUrl: z.string().url("URL deve ser válida").optional().or(z.literal("")),
  projectType: z.string().default("website"),
  projectUrl: z.string().url("URL do projeto deve ser válida").optional().or(z.literal(""))
});

const projectEditSchema = z.object({
  budget: z.coerce.number().positive("Orçamento deve ser um valor positivo").optional(),
  amountReceived: z.coerce.number().min(0, "Valor recebido não pode ser negativo").default(0),
  amountPending: z.coerce.number().min(0, "Valor pendente não pode ser negativo").default(0),
  status: z.string(),
  projectUrl: z.string().url("URL deve ser válida").optional().or(z.literal(""))
});

const platformCostSchema = z.object({
  platform: z.string().min(1, "Nome da plataforma é obrigatório"),
  cost: z.coerce.number().positive("Valor deve ser positivo"),
  month_year: z.string().min(1, "Mês/Ano é obrigatório"),
  description: z.string().optional()
});

export default function ModernAdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: leads = [], isLoading: leadsLoading } = useLeads();
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedLeadNotes, setSelectedLeadNotes] = useState<any[]>([]);
  const [selectedLeadProjects, setSelectedLeadProjects] = useState<any[]>([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreatePlatformCost, setShowCreatePlatformCost] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [platformCosts, setPlatformCosts] = useState<any[]>([]);

  // Query for new appointments count
  const { data: newAppointmentsCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ['/api/appointments/new-count'],
    refetchInterval: 30000
  });

  // Mutation to mark appointment as viewed
  const markAsViewedMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return apiRequest("PATCH", `/api/appointments/${appointmentId}/viewed`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/new-count'] });
      toast({
        title: "Agendamento marcado como visto",
        description: "O agendamento foi marcado como visualizado."
      });
    }
  });

  // Mutation to delete appointment
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return apiRequest("DELETE", `/api/appointments/${appointmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/new-count'] });
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive"
      });
    }
  });

  const noteForm = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      note: "",
      type: "general"
    }
  });

  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "planning",
      budget: "",
      amountReceived: "0",
      amountPending: "0",
      startDate: "",
      endDate: "",
      progress: 0,
      source: "direto",
      sourceUrl: "",
      projectType: "website",
      projectUrl: ""
    }
  });

  const platformCostForm = useForm<z.infer<typeof platformCostSchema>>({
    resolver: zodResolver(platformCostSchema),
    defaultValues: {
      platform: "",
      cost: 0,
      month_year: "",
      description: ""
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Lead excluído",
        description: "Lead foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o lead.",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/projects/${id}`);
    },
    onSuccess: () => {
      fetchProjects();
      toast({
        title: "Projeto excluído",
        description: "Projeto foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
    },
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      toast({
        title: "Status atualizado",
        description: "Status do lead foi atualizado com sucesso.",
      });
    },
  });

  const updateAppointmentStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Agendamento atualizado",
        description: "Status do agendamento foi atualizado com sucesso.",
      });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: async ({ leadId, noteData }: { leadId: number; noteData: z.infer<typeof noteSchema> }) => {
      const response = await apiRequest("POST", `/api/leads/${leadId}/notes`, noteData);
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/leads/${variables.leadId}/notes`] });
      noteForm.reset();
      toast({
        title: "Anotação criada",
        description: "Anotação foi adicionada com sucesso.",
      });
      fetchLeadNotes(variables.leadId);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      console.log("Making API request with:", projectData);
      const response = await apiRequest("POST", "/api/projects", projectData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create project");
      }
      return response.json();
    },
    onSuccess: (newProject) => {
      console.log("Project created successfully:", newProject);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      projectForm.reset();
      setShowCreateProject(false);
      fetchProjects();
      toast({
        title: "Projeto criado",
        description: "Novo projeto foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error("Project creation error:", error);
      toast({
        title: "Erro ao criar projeto",
        description: error.message || "Não foi possível criar o projeto.",
        variant: "destructive",
      });
    },
  });

  const createPlatformCostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof platformCostSchema>) => {
      return await apiRequest("POST", "/api/platform-costs", data);
    },
    onSuccess: () => {
      toast({ title: "Pagamento registrado com sucesso!" });
      platformCostForm.reset();
      setShowCreatePlatformCost(false);
      fetchPlatformCosts();
      queryClient.invalidateQueries({ queryKey: ['/api/platform-costs'] });
    },
    onError: () => {
      toast({ 
        title: "Erro ao registrar pagamento", 
        description: "Tente novamente mais tarde",
        variant: "destructive" 
      });
    }
  });

  const fetchProjects = async () => {
    try {
      const response = await apiRequest("GET", "/api/projects");
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchPlatformCosts = async () => {
    try {
      const response = await fetch('/api/platform-costs');
      if (response.ok) {
        const costsData = await response.json();
        setPlatformCosts(costsData);
      }
    } catch (error) {
      console.error('Error fetching platform costs:', error);
    }
  };

  const fetchLeadNotes = async (leadId: number) => {
    try {
      const response = await apiRequest("GET", `/api/leads/${leadId}/notes`);
      const notes = await response.json();
      setSelectedLeadNotes(notes);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    }
  };

  const fetchLeadProjects = async (leadId: number) => {
    try {
      const leadProjects = projects.filter(project => project.leadId === leadId);
      setSelectedLeadProjects(leadProjects);
    } catch (error) {
      console.error("Failed to fetch lead projects:", error);
    }
  };

  const handleViewLead = (lead: any) => {
    setSelectedLead(lead);
    fetchLeadNotes(lead.id);
    fetchLeadProjects(lead.id);
  };

  // Buscar projetos quando o componente carregar
  useEffect(() => {
    fetchProjects();
    fetchPlatformCosts();
  }, []);

  const handleSaveNote = (data: z.infer<typeof noteSchema>) => {
    if (selectedLead) {
      createNoteMutation.mutate({ leadId: selectedLead.id, noteData: data });
    }
  };

  const handleCreateProject = (data: z.infer<typeof projectSchema>) => {
    console.log("Form data submitted:", data);
    createProjectMutation.mutate(data);
  };

  const handleCreatePlatformCost = (data: z.infer<typeof platformCostSchema>) => {
    createPlatformCostMutation.mutate(data);
  };

  // Project Edit Form Component
  const ProjectEditForm = ({ project, onUpdate }: { project: any; onUpdate: () => void }) => {
    const editForm = useForm<z.infer<typeof projectSchema>>({
      resolver: zodResolver(projectSchema),
      defaultValues: {
        name: project.name || "",
        description: project.description || "",
        leadId: project.leadId,
        status: project.status || "planning",
        budget: project.budget || "",
        amountReceived: project.amountReceived || "0",
        amountPending: project.amountPending || "0",
        startDate: project.startDate || "",
        endDate: project.endDate || "",
        progress: project.progress || 0,
        source: project.source || "direto",
        sourceUrl: project.sourceUrl || "",
        projectType: project.projectType || "website",
        projectUrl: project.projectUrl || ""
      }
    });

    const updateProjectMutation = useMutation({
      mutationFn: async (data: z.infer<typeof projectSchema>) => {
        return await apiRequest("PATCH", `/api/projects/${project.id}`, data);
      },
      onSuccess: () => {
        toast({ title: "Projeto atualizado com sucesso!" });
        onUpdate();
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      },
      onError: () => {
        toast({ 
          title: "Erro ao atualizar projeto", 
          description: "Tente novamente mais tarde",
          variant: "destructive" 
        });
      }
    });

    const handleUpdateProject = (data: z.infer<typeof projectSchema>) => {
      updateProjectMutation.mutate(data);
    };

    return (
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(handleUpdateProject)} className="space-y-4">
          <FormField
            control={editForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Site da empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva o projeto..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="leadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente Associado (Opcional)</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum cliente</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id.toString()}>
                        {lead.name} - {lead.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orçamento Total (R$)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="5000" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Entrega</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Financial Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="amountReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Recebido (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || "0")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={editForm.control}
              name="amountPending"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Pendente (R$)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || "0")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={editForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="negotiation">Negociação</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                    <SelectItem value="testing">Teste</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Source and Project Type Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem do Projeto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="99freelas">99Freelas</SelectItem>
                      <SelectItem value="direto">Direto</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={editForm.control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Projeto</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="website">Site</SelectItem>
                      <SelectItem value="app-flutter">App Flutter</SelectItem>
                      <SelectItem value="sistema">Sistema Web</SelectItem>
                      <SelectItem value="landing-page">Landing Page</SelectItem>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={editForm.control}
            name="sourceUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Plataforma (Opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: https://www.99freelas.com.br/projeto/123456" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={editForm.control}
            name="projectUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL do Projeto Finalizado (Opcional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: https://meusite.com.br"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={updateProjectMutation.isPending}
            >
              {updateProjectMutation.isPending ? "Atualizando..." : "Atualizar Projeto"}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  const filteredLeads = leads.filter(lead => 
    statusFilter === "all" || lead.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { label: "Novo", variant: "default" as const, color: "bg-blue-500" },
      contacted: { label: "Contatado", variant: "secondary" as const, color: "bg-yellow-500" },
      negotiating: { label: "Negociando", variant: "outline" as const, color: "bg-orange-500" },
      closed: { label: "Fechado", variant: "destructive" as const, color: "bg-green-500" },
      cancelled: { label: "Cancelado", variant: "destructive" as const, color: "bg-red-500" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.new;
    return (
      <Badge variant={config.variant} className={`${config.color} text-white border-0`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const handleStatusChange = (leadId: number, newStatus: string) => {
    updateLeadStatusMutation.mutate({ id: leadId, status: newStatus });
  };

  const handleContactLead = (whatsapp: string) => {
    const cleanWhatsapp = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanWhatsapp}`, '_blank');
  };

  const handleDeleteLead = (leadId: number) => {
    if (confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      deleteLeadMutation.mutate(leadId);
    }
  };

  // Calculate project and financial statistics
  const projectStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => ['planning', 'approved', 'in-progress'].includes(p.status)).length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, project) => {
      const budget = project.budget || 0;
      const budgetValue = typeof budget === 'string' ? parseFloat(budget.replace(',', '.')) : Number(budget);
      return sum + (isNaN(budgetValue) ? 0 : budgetValue);
    }, 0),
    totalReceived: projects.reduce((sum, project) => {
      const received = project.amountReceived || 0;
      const receivedValue = typeof received === 'string' ? parseFloat(received.replace(',', '.')) : Number(received);
      return sum + (isNaN(receivedValue) ? 0 : receivedValue);
    }, 0),
    totalPending: projects.reduce((sum, project) => {
      const pending = project.amountPending || 0;
      const pendingValue = typeof pending === 'string' ? parseFloat(pending.replace(',', '.')) : Number(pending);
      return sum + (isNaN(pendingValue) ? 0 : pendingValue);
    }, 0)
  };

  // Calculate 99Freelas specific statistics
  const freelasProjects = projects.filter(p => p.source === '99freelas');
  const freelasStats = {
    totalProjects: freelasProjects.length,
    completedProjects: freelasProjects.filter(p => p.status === 'completed').length,
    activeProjects: freelasProjects.filter(p => ['planning', 'approved', 'in-progress', 'negotiation'].includes(p.status)).length,
    totalRevenue: freelasProjects.reduce((sum, project) => {
      const budget = project.budget || 0;
      const budgetValue = typeof budget === 'string' ? parseFloat(budget.replace(',', '.')) : Number(budget);
      return sum + (isNaN(budgetValue) ? 0 : budgetValue);
    }, 0),
    totalReceived: freelasProjects.reduce((sum, project) => {
      const received = project.amountReceived || 0;
      const receivedValue = typeof received === 'string' ? parseFloat(received.replace(',', '.')) : Number(received);
      return sum + (isNaN(receivedValue) ? 0 : receivedValue);
    }, 0)
  };

  // Calculate platform costs statistics
  const platformStats = {
    totalCosts: (platformCosts.reduce((sum, cost) => sum + (parseFloat(cost.cost) || 0), 0)) + (49.99 * 4), // 4 meses fixos do 99Freelas
    monthlyAverage: 49.99, // Média do 99Freelas
    lastMonthCosts: 49.99 // Junho 2025
  };

  const dashboardMetrics = {
    "Total de Leads": leads.length,
    "Leads Ativos": leads.filter(l => l.status === 'novo' || l.status === 'contato-realizado').length,
    "Agendamentos": appointments.length,
    "Agendamentos Novos": newAppointmentsCount.count,
    "Projetos Ativos": projectStats.activeProjects,
    "Revenue": projectStats.totalReceived,
    "Custos da Plataforma": platformStats.totalCosts,
    "Lucro Líquido": projectStats.totalReceived - platformStats.totalCosts
  };

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    activeProjects: projectStats.activeProjects,
    closedDeals: leads.filter(l => l.status === 'closed').length,
    totalRevenue: projectStats.totalReceived
  };

  if (leadsLoading || appointmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BarChart3 className="mr-3 h-8 w-8" />
              Painel Administrativo
            </h1>
            <p className="text-purple-100 mt-1">Gerencie leads, projetos e cronogramas</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="bg-white text-purple-600 hover:bg-purple-50 border-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Dashboard Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Object.entries(dashboardMetrics).map(([key, value]) => (
            <Card key={key} className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{key}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {key.includes('Revenue') || key.includes('Budget') || key.includes('Custos') || key.includes('Lucro') ? 
                        `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        value
                      }
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    key.includes('Lucro') ? 
                      (value >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-red-600') :
                    key.includes('Custos') ? 
                      'bg-gradient-to-br from-orange-500 to-red-600' :
                      'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {key.includes('Lucro') ? 
                      (value >= 0 ? <TrendingUp className="h-6 w-6 text-white" /> : <TrendingDown className="h-6 w-6 text-white" />) :
                     key.includes('Custos') ? 
                      <DollarSign className="h-6 w-6 text-white" /> :
                      <TrendingUp className="h-6 w-6 text-white" />
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total de Leads</p>
                  <p className="text-3xl font-bold">{stats.totalLeads}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg min-h-[100px] sm:min-h-[120px]">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Novos Leads</p>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold">{stats.newLeads}</p>
                </div>
                <Plus className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg min-h-[100px] sm:min-h-[120px]">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-xs sm:text-sm">Em Negociação</p>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold">{stats.activeProjects}</p>
                </div>
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg min-h-[100px] sm:min-h-[120px]">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xs sm:text-sm">Projetos Fechados</p>
                  <p className="text-lg sm:text-2xl md:text-3xl font-bold">{stats.closedDeals}</p>
                </div>
                <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-lg min-h-[100px] sm:min-h-[120px]">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm">Receita Total</p>
                  <p className="text-sm sm:text-xl md:text-2xl font-bold">R$ {projectStats.totalReceived.toLocaleString()}</p>
                </div>
                <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 md:h-8 md:w-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-4 sm:space-y-6">
          <TabsList className="bg-white shadow-lg border border-gray-200 p-1 grid grid-cols-2 sm:grid-cols-6 h-auto">
            <TabsTrigger value="leads" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3 flex-col sm:flex-row">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">Gerenciar </span>Leads
            </TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white relative text-xs sm:text-sm py-2 sm:py-3 flex-col sm:flex-row">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              Agendamentos
              {newAppointmentsCount?.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center animate-pulse">
                  {newAppointmentsCount.count}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3 flex-col sm:flex-row">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3 flex-col sm:flex-row">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">99Freelas </span>Analytics
            </TabsTrigger>
            <TabsTrigger value="guidelines" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3 flex-col sm:flex-row">
              <Code className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">Como Criar </span>Sistema
            </TabsTrigger>
            <TabsTrigger value="ai-analyzer" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3 flex-col sm:flex-row">
              <Brain className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2 mb-1 sm:mb-0" />
              <span className="hidden sm:inline">IA </span>Analyzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <CardTitle className="flex items-center text-lg sm:text-xl">
                    <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                    Gerenciar Leads
                  </CardTitle>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] bg-white/20 border-white/30 text-white">
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
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">Contato</TableHead>
                        <TableHead className="font-semibold">Serviço</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Orçamento</TableHead>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLeads.map((lead) => (
                        <TableRow key={lead.id} className={`hover:bg-purple-50/50 transition-colors ${getPriorityColor(lead.priority || 'medium')}`}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{lead.name}</div>
                              {lead.message && (
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                  "{lead.message}"
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{lead.whatsapp}</div>
                              <div className="text-xs text-gray-500">{lead.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {lead.serviceType}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(lead.status)}</TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              {lead.budget ? `R$ ${parseFloat(lead.budget).toLocaleString()}` : 'Não definido'}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContactLead(lead.whatsapp)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewLead(lead)}
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes do Lead - {selectedLead?.name}</DialogTitle>
                                  </DialogHeader>
                                  {selectedLead && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Email:</label>
                                          <p className="text-sm text-gray-600">{selectedLead.email}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">WhatsApp:</label>
                                          <p className="text-sm text-gray-600">{selectedLead.whatsapp}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Serviço:</label>
                                          <p className="text-sm text-gray-600">{selectedLead.serviceType}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Status:</label>
                                          <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                                        </div>
                                      </div>
                                      {selectedLead.message && (
                                        <div>
                                          <label className="text-sm font-medium">Mensagem:</label>
                                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedLead.message}</p>
                                        </div>
                                      )}
                                      
                                      {/* Projetos Relacionados */}
                                      <div className="space-y-3">
                                        <label className="text-sm font-medium">Projetos do Cliente:</label>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                          {selectedLeadProjects.length > 0 ? (
                                            selectedLeadProjects.map((project, index) => (
                                              <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <h4 className="text-sm font-semibold text-green-800">{project.name}</h4>
                                                    {project.description && (
                                                      <p className="text-xs text-green-600 mt-1">{project.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                      <Badge 
                                                        variant="outline" 
                                                        className="text-xs bg-green-100 text-green-700 border-green-300"
                                                      >
                                                        {project.status === 'planning' ? 'Planejamento' :
                                                         project.status === 'negotiation' ? 'Negociação' :
                                                         project.status === 'approved' ? 'Aprovado' :
                                                         project.status === 'in-progress' ? 'Em Andamento' :
                                                         project.status === 'testing' ? 'Teste' :
                                                         project.status === 'completed' ? 'Concluído' :
                                                         project.status === 'cancelled' ? 'Cancelado' : project.status}
                                                      </Badge>
                                                      {project.budget && (
                                                        <span className="text-xs text-green-600 font-medium">
                                                          R$ {parseFloat(project.budget).toLocaleString()}
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2">
                                                  Criado em: {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                                                </p>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-sm text-gray-500 italic">Nenhum projeto ainda</p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Existing Notes */}
                                      <div className="space-y-3">
                                        <label className="text-sm font-medium">Histórico de Anotações:</label>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                          {selectedLeadNotes.length > 0 ? (
                                            selectedLeadNotes.map((note, index) => (
                                              <div key={index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <p className="text-sm text-gray-700">{note.note}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                  {new Date(note.createdAt).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </p>
                                              </div>
                                            ))
                                          ) : (
                                            <p className="text-sm text-gray-500 italic">Nenhuma anotação ainda</p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Add New Note Form */}
                                      <div className="border-t pt-4">
                                        <Form {...noteForm}>
                                          <form onSubmit={noteForm.handleSubmit(handleSaveNote)} className="space-y-3">
                                            <FormField
                                              control={noteForm.control}
                                              name="note"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Nova Anotação:</FormLabel>
                                                  <FormControl>
                                                    <Textarea
                                                      placeholder="Adicione suas anotações sobre este lead..."
                                                      className="min-h-[100px]"
                                                      {...field}
                                                    />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                            <FormField
                                              control={noteForm.control}
                                              name="type"
                                              render={({ field }) => (
                                                <FormItem>
                                                  <FormLabel>Tipo:</FormLabel>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                      <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o tipo" />
                                                      </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                      <SelectItem value="general">Geral</SelectItem>
                                                      <SelectItem value="contact">Contato</SelectItem>
                                                      <SelectItem value="negotiation">Negociação</SelectItem>
                                                      <SelectItem value="technical">Técnico</SelectItem>
                                                      <SelectItem value="follow-up">Follow-up</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />
                                            <Button 
                                              type="submit" 
                                              className="w-full bg-blue-600 hover:bg-blue-700"
                                              disabled={createNoteMutation.isPending}
                                            >
                                              {createNoteMutation.isPending ? "Salvando..." : "Salvar Anotação"}
                                            </Button>
                                          </form>
                                        </Form>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Select
                                value={lead.status}
                                onValueChange={(value) => handleStatusChange(lead.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">Novo</SelectItem>
                                  <SelectItem value="contacted">Contatado</SelectItem>
                                  <SelectItem value="negotiating">Negociando</SelectItem>
                                  <SelectItem value="closed">Fechado</SelectItem>
                                  <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteLead(lead.id)}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Nenhum lead encontrado</p>
                    <p className="text-sm">Leads aparecerão aqui quando novos clientes se cadastrarem</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="mr-2 h-5 w-5" />
                  Gerenciar Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Layout para desktop */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Cliente</TableHead>
                        <TableHead className="font-semibold">Contato</TableHead>
                        <TableHead className="font-semibold">Data</TableHead>
                        <TableHead className="font-semibold">Horário</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appointments.map((appointment) => (
                        <TableRow 
                          key={appointment.id} 
                          className={`transition-colors ${!appointment.isViewed && appointment.status === 'scheduled' 
                            ? 'bg-red-50 border-l-4 border-l-red-500 hover:bg-red-100' 
                            : 'hover:bg-blue-50/50'
                          }`}
                        >
                          <TableCell className="font-medium">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{appointment.name}</span>
                                {!appointment.isViewed && appointment.status === 'scheduled' && (
                                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                    NOVO
                                  </span>
                                )}
                              </div>
                              {appointment.notes && (
                                <div className="text-sm text-gray-600 max-w-xs truncate">
                                  {appointment.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">{appointment.phone}</div>
                              <div className="text-xs text-gray-500">{appointment.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {appointment.date ? new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não definida'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {appointment.time}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={appointment.status === 'scheduled' ? 'default' : 
                                           appointment.status === 'completed' ? 'secondary' : 'destructive'}
                                   className={appointment.status === 'scheduled' ? 'bg-green-500' :
                                             appointment.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}>
                              {appointment.status === 'scheduled' ? 'Agendado' : 
                               appointment.status === 'completed' ? 'Realizado' : 'Cancelado'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleContactLead(appointment.phone)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Select
                                value={appointment.status}
                                onValueChange={(value) => updateAppointmentStatusMutation.mutate({ 
                                  id: appointment.id, 
                                  status: value 
                                })}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">Agendado</SelectItem>
                                  <SelectItem value="completed">Realizado</SelectItem>
                                  <SelectItem value="cancelled">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                              {!appointment.isViewed && appointment.status === 'scheduled' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markAsViewedMutation.mutate(appointment.id)}
                                  className="text-green-600 border-green-300 hover:bg-green-50"
                                  disabled={markAsViewedMutation.isPending}
                                >
                                  {markAsViewedMutation.isPending ? 'Marcando...' : 'Marcar como Visto'}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                                disabled={deleteAppointmentMutation.isPending}
                                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Layout responsivo para mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        {/* Header com nome e status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{appointment.name}</h3>
                            {!appointment.isViewed && appointment.status === 'scheduled' && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                                NOVO
                              </span>
                            )}
                          </div>
                          <Badge variant={appointment.status === 'scheduled' ? 'default' : 
                                         appointment.status === 'completed' ? 'secondary' : 'destructive'}
                                 className={appointment.status === 'scheduled' ? 'bg-green-500' :
                                           appointment.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}>
                            {appointment.status === 'scheduled' ? 'Agendado' : 
                             appointment.status === 'completed' ? 'Realizado' : 'Cancelado'}
                          </Badge>
                        </div>

                        {/* Informações do agendamento */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Telefone</div>
                            <div className="text-sm font-medium">{appointment.phone}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</div>
                            <div className="text-sm text-gray-600 truncate">{appointment.email}</div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data</div>
                            <div className="text-sm font-medium">
                              {appointment.date ? new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR') : 'Data não definida'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Horário</div>
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                              {appointment.time}
                            </Badge>
                          </div>
                        </div>

                        {/* Observações se existirem */}
                        {appointment.notes && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Observações</div>
                            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {appointment.notes}
                            </div>
                          </div>
                        )}

                        {/* Botões de ação - sempre embaixo dentro do card */}
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleContactLead(appointment.phone)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200 flex-1 min-w-0"
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Contatar
                          </Button>
                          
                          <Select
                            value={appointment.status}
                            onValueChange={(value) => updateAppointmentStatusMutation.mutate({ 
                              id: appointment.id, 
                              status: value 
                            })}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Agendado</SelectItem>
                              <SelectItem value="completed">Realizado</SelectItem>
                              <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {!appointment.isViewed && appointment.status === 'scheduled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsViewedMutation.mutate(appointment.id)}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              disabled={markAsViewedMutation.isPending}
                            >
                              {markAsViewedMutation.isPending ? 'Marcando...' : 'Marcar como Visto'}
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                            disabled={deleteAppointmentMutation.isPending}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {appointments.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Nenhum agendamento encontrado</p>
                    <p className="text-sm">Agendamentos aparecerão aqui quando clientes marcarem horários</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-xl">
                    <Settings className="mr-2 h-5 w-5" />
                    Gerenciar Projetos
                  </CardTitle>
                  <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                    <DialogTrigger asChild>
                      <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Projeto
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Projeto</DialogTitle>
                      </DialogHeader>
                      <Form {...projectForm}>
                        <form onSubmit={projectForm.handleSubmit(handleCreateProject)} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={projectForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Projeto</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: Site Institucional" {...field} />
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
                                  <FormLabel>Orçamento Total (R$)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="2500" 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={projectForm.control}
                            name="leadId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cliente/Lead (Opcional)</FormLabel>
                                <Select onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))} value={field.value?.toString() || "none"}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione um cliente" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">Nenhum cliente</SelectItem>
                                    {leads.map((lead) => (
                                      <SelectItem key={lead.id} value={lead.id.toString()}>
                                        {lead.name} - {lead.email}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
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
                                  <Textarea 
                                    placeholder="Descreva os detalhes do projeto..."
                                    className="min-h-[100px]"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={projectForm.control}
                              name="startDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data de Início</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={projectForm.control}
                              name="endDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data de Entrega</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Financial Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={projectForm.control}
                              name="amountReceived"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valor Recebido (R$)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value || "0")}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={projectForm.control}
                              name="amountPending"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Valor Pendente (R$)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="0" 
                                      value={field.value || ""}
                                      onChange={(e) => field.onChange(e.target.value || "0")}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={projectForm.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status Inicial</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="planning">Planejamento</SelectItem>
                                    <SelectItem value="negotiation">Negociação</SelectItem>
                                    <SelectItem value="approved">Aprovado</SelectItem>
                                    <SelectItem value="in-progress">Em Andamento</SelectItem>
                                    <SelectItem value="testing">Teste</SelectItem>
                                    <SelectItem value="completed">Concluído</SelectItem>
                                    <SelectItem value="cancelled">Cancelado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Source and Project Type Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={projectForm.control}
                              name="source"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Origem do Projeto</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione a origem" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="99freelas">99Freelas</SelectItem>
                                      <SelectItem value="website">Site/Landing Page</SelectItem>
                                      <SelectItem value="indicacao">Indicação</SelectItem>
                                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                      <SelectItem value="direto">Contato Direto</SelectItem>
                                      <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={projectForm.control}
                              name="projectType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Projeto</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="website">Site/Website</SelectItem>
                                      <SelectItem value="app-flutter">App Flutter</SelectItem>
                                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                                      <SelectItem value="sistema">Sistema Web</SelectItem>
                                      <SelectItem value="landing-page">Landing Page</SelectItem>
                                      <SelectItem value="blog">Blog</SelectItem>
                                      <SelectItem value="api">API/Backend</SelectItem>
                                      <SelectItem value="outros">Outros</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={projectForm.control}
                            name="sourceUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL da Plataforma (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: https://www.99freelas.com.br/projeto/123456" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={projectForm.control}
                            name="projectUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL do Projeto Finalizado (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: https://meusite.com.br"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button 
                              type="submit" 
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              disabled={createProjectMutation.isPending}
                            >
                              {createProjectMutation.isPending ? "Criando..." : "Criar Projeto"}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowCreateProject(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Total Orçado</p>
                          <p className="text-2xl font-bold">R$ {projectStats.totalBudget.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <DollarSign className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-sm">Valor Recebido</p>
                          <p className="text-2xl font-bold">R$ {projectStats.totalReceived.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Valor Pendente</p>
                          <p className="text-2xl font-bold">R$ {projectStats.totalPending.toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <Clock className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">A Receber</p>
                          <p className="text-2xl font-bold">R$ {(projectStats.totalBudget - projectStats.totalReceived).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/20 p-2 rounded-lg">
                          <ArrowUp className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Project Template Cards */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50/50 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">Site Institucional</h3>
                      <p className="text-sm text-gray-600 mb-4">Website completo com design responsivo</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>R$ 1.500 - R$ 3.500</span>
                        <span>15-30 dias</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Settings className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">Sistema Web</h3>
                      <p className="text-sm text-gray-600 mb-4">Aplicação web personalizada</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>R$ 3.000 - R$ 8.000</span>
                        <span>30-60 dias</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Phone className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-2">Landing Page</h3>
                      <p className="text-sm text-gray-600 mb-4">Página de conversão otimizada</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>R$ 800 - R$ 2.000</span>
                        <span>7-15 dias</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Projetos Criados */}
                {projects.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      Projetos Criados ({projects.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {projects.map((project) => {
                        const relatedLead = leads.find(lead => lead.id === project.leadId);
                        return (
                          <Card key={project.id} className="border-l-4 border-green-500 hover:shadow-lg transition-shadow h-fit">
                            <CardContent className="p-5">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-800 text-base mb-2 break-words leading-tight">{project.name}</h4>
                                  {project.projectUrl && (
                                    <a 
                                      href={project.projectUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center"
                                    >
                                      <Eye className="h-4 w-4 mr-1 flex-shrink-0" />
                                      <span className="truncate">Ver projeto</span>
                                    </a>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs whitespace-nowrap ${
                                      project.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300' :
                                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                      project.status === 'negotiation' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                      project.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                                      'bg-gray-100 text-gray-700 border-gray-300'
                                    }`}
                                  >
                                    {project.status === 'planning' ? 'Planejamento' :
                                     project.status === 'negotiation' ? 'Negociação' :
                                     project.status === 'approved' ? 'Aprovado' :
                                     project.status === 'in-progress' ? 'Em Andamento' :
                                     project.status === 'testing' ? 'Teste' :
                                     project.status === 'completed' ? 'Concluído' :
                                     project.status === 'cancelled' ? 'Cancelado' : project.status}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Tem certeza que deseja excluir este projeto?')) {
                                        deleteProjectMutation.mutate(project.id);
                                      }
                                    }}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              {/* Financial Information */}
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-xs">
                                  <span className="text-gray-600">Orçamento:</span>
                                  <span className="font-medium">R$ {parseFloat(project.budget || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-green-600">Recebido:</span>
                                  <span className="font-medium text-green-600">R$ {parseFloat(project.amountReceived || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-orange-600">Pendente:</span>
                                  <span className="font-medium text-orange-600">R$ {parseFloat(project.amountPending || '0').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs border-t pt-1">
                                  <span className="text-gray-800 font-medium">A Receber:</span>
                                  <span className="font-bold text-purple-600">
                                    R$ {(parseFloat(project.budget || '0') - parseFloat(project.amountReceived || '0')).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              
                              {relatedLead && (
                                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs font-medium text-blue-800">Cliente:</p>
                                  <p className="text-xs text-blue-600">{relatedLead.name}</p>
                                  <p className="text-xs text-blue-500">{relatedLead.email}</p>
                                </div>
                              )}
                              
                              {project.description && (
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                              )}
                              
                              <div className="flex justify-between items-end mb-3">
                                <div>
                                  {project.budget && (
                                    <p className="text-sm font-semibold text-green-600">
                                      R$ {parseFloat(project.budget).toLocaleString()}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-500">
                                    {new Date(project.createdAt).toLocaleDateString('pt-BR')}
                                  </p>
                                </div>
                                
                                <div className="flex gap-1">
                                  {project.startDate && (
                                    <div className="text-center">
                                      <p className="text-xs text-gray-500">Início</p>
                                      <p className="text-xs font-medium">
                                        {new Date(project.startDate).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {project.endDate && (
                                    <div className="text-center ml-2">
                                      <p className="text-xs text-gray-500">Entrega</p>
                                      <p className="text-xs font-medium">
                                        {new Date(project.endDate).toLocaleDateString('pt-BR')}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-xs">
                                    <Edit className="h-3 w-3 mr-1" />
                                    Editar Valores
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Editar Projeto - {project.name}</DialogTitle>
                                  </DialogHeader>
                                  <ProjectEditForm project={project} onUpdate={() => fetchProjects()} />
                                </DialogContent>
                              </Dialog>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Timeline Example */}
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Cronograma Padrão de Projeto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                      <h4 className="font-medium text-green-700">Briefing</h4>
                      <p className="text-xs text-green-600">Análise de requisitos</p>
                      <p className="text-xs text-gray-500">2-3 dias</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                      <h4 className="font-medium text-blue-700">Design</h4>
                      <p className="text-xs text-blue-600">Layout e protótipo</p>
                      <p className="text-xs text-gray-500">5-7 dias</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                      <h4 className="font-medium text-orange-700">Desenvolvimento</h4>
                      <p className="text-xs text-orange-600">Programação e integração</p>
                      <p className="text-xs text-gray-500">10-15 dias</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4</div>
                      <h4 className="font-medium text-purple-700">Entrega</h4>
                      <p className="text-xs text-purple-600">Testes e deploy</p>
                      <p className="text-xs text-gray-500">2-3 dias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Performance Cards */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-orange-700 flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Perfil 99Freelas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Ranking: <span className="font-semibold">1575</span></div>
                    <div className="text-sm text-gray-600">Projetos Concluídos: <span className="font-semibold">{freelasStats.completedProjects}</span></div>
                    <div className="text-sm text-gray-600">Membro desde: <span className="font-semibold">01/09/2024</span></div>
                    <div className="text-sm text-gray-600">Status: <span className="text-green-600 font-semibold">Ativo</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Receita da Plataforma
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    R$ {freelasStats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {freelasStats.activeProjects} projetos ativos
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-gradient-to-br from-red-50 to-red-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-red-700 flex items-center">
                    <TrendingDown className="mr-2 h-5 w-5" />
                    Custo Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600 mb-2">R$ 49,99</div>
                  <div className="text-sm text-gray-600">Assinatura mensal</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROI Analysis */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Análise de ROI
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Receita Total (99Freelas):</span>
                      <span className="font-bold text-green-600">
                        R$ {freelasStats.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Custo Acumulado:</span>
                      <span className="font-bold text-red-600">R$ 199,96</span>
                      <span className="text-xs text-gray-500">(4 meses)</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-gray-700 font-semibold">ROI:</span>
                      <span className="font-bold text-green-700 text-lg">
                        {freelasStats.totalRevenue > 0 ? (((freelasStats.totalRevenue - 199.96) / 199.96 * 100).toFixed(1)) : '0.0'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Performance */}
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <FileText className="mr-2 h-5 w-5" />
                    Performance de Projetos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {freelasProjects.map((project) => (
                      <div key={project.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-800">{project.name}</div>
                          <div className="text-sm text-gray-600">{project.projectType}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">R$ {parseFloat(project.budget || '0').toLocaleString()}</div>
                          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {project.status === 'completed' ? 'Concluído' : 
                             project.status === 'in_progress' ? 'Em Andamento' : 
                             project.status === 'planning' ? 'Planejamento' : 'Pausado'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {(!freelasProjects.length) && (
                      <div className="text-center text-gray-500 py-8">
                        Nenhum projeto da 99Freelas encontrado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Cost Management */}
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mt-6">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Settings className="mr-2 h-5 w-5" />
                  Gerenciar Custos da Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Histórico de Pagamentos</h3>
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => setShowCreatePlatformCost(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {/* Histórico fixo do 99Freelas */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">99Freelas - Junho 2025</div>
                      <div className="text-sm text-gray-600">Pagamento em 18/06/2025</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">R$ 49,99</div>
                      <Badge variant="default" className="text-xs">Pago</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">99Freelas - Maio 2025</div>
                      <div className="text-sm text-gray-600">Pagamento em 18/05/2025</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">R$ 49,99</div>
                      <Badge variant="default" className="text-xs">Pago</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">99Freelas - Abril 2025</div>
                      <div className="text-sm text-gray-600">Pagamento em 18/04/2025</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">R$ 49,99</div>
                      <Badge variant="default" className="text-xs">Pago</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">99Freelas - Março 2025</div>
                      <div className="text-sm text-gray-600">Pagamento em 18/03/2025</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">R$ 49,99</div>
                      <Badge variant="default" className="text-xs">Pago</Badge>
                    </div>
                  </div>

                  {/* Pagamentos dinâmicos do banco */}
                  {platformCosts.map((cost) => (
                    <div key={cost.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-semibold">{cost.platform} - {cost.month_year}</div>
                        <div className="text-sm text-gray-600">
                          Pagamento em {new Date(cost.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        {cost.description && (
                          <div className="text-xs text-gray-500 mt-1">{cost.description}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">
                          R$ {parseFloat(cost.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <Badge variant="default" className="text-xs">Pago</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Como Criar um Sistema Tab */}
          <TabsContent value="guidelines">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center text-xl">
                  <Settings className="mr-2 h-5 w-5" />
                  Guia de Desenvolvimento de Sistemas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                {/* Protocolo de Modificação de Arquivos */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Protocolo de Modificação de Arquivos
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-3">
                    <p className="font-semibold text-blue-800">
                      Regra Fundamental: Modifique, Não Duplique
                    </p>
                    <p>
                      Para realizar qualquer alteração no sistema, siga rigorosamente este protocolo: 
                      <strong> se o arquivo já existir, faça a modificação diretamente no arquivo original</strong>. 
                      Jamais crie um arquivo duplicado.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <strong>✅ Correto:</strong> Editar arquivo existente<br/>
                        <strong>❌ Incorreto:</strong> Criar novo arquivo
                      </p>
                    </div>
                    <p>
                      A criação de novos arquivos deve ocorrer <em>apenas</em> quando o arquivo original não existir. 
                      Este protocolo garante a integridade, consistência e organização do sistema de gestão de arquivos.
                    </p>
                  </div>
                </div>

                {/* Diretrizes de Design e UX/UI Universais */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Diretrizes de Design e UX/UI Universais
                  </h3>
                  
                  <div className="space-y-6">
                    
                    {/* Estética e Identidade Visual */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Estética e Identidade Visual
                      </h4>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• <strong>Paleta de cores consistente:</strong> Definir cores primária, secundária e neutras</li>
                        <li>• <strong>Tipografia hierárquica:</strong> Títulos, subtítulos e corpo com pesos diferenciados</li>
                        <li>• <strong>Iconografia uniforme:</strong> Estilo consistente em todos os ícones</li>
                        <li>• <strong>Espaçamento padronizado:</strong> Grid system e margem/padding consistentes</li>
                        <li>• <strong>Branding coerente:</strong> Logo, cores e elementos visuais alinhados</li>
                      </ul>
                    </div>

                    {/* Arquitetura de Informação */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Arquitetura de Informação
                      </h4>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• <strong>Agrupamento lógico:</strong> Funcionalidades relacionadas organizadas em seções</li>
                        <li>• <strong>Hierarquia clara:</strong> Informações prioritárias em destaque</li>
                        <li>• <strong>Navegação intuitiva:</strong> Fluxos de usuário otimizados</li>
                        <li>• <strong>Minimalismo funcional:</strong> Reduzir cognitive load do usuário</li>
                        <li>• <strong>Responsividade completa:</strong> Adaptação para todos os dispositivos</li>
                      </ul>
                    </div>

                    {/* Elementos de Credibilidade */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                        <Star className="mr-2 h-4 w-4" />
                        Elementos de Credibilidade
                      </h4>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• <strong>Depoimentos e avaliações:</strong> Social proof autêntico</li>
                        <li>• <strong>Certificações e prêmios:</strong> Validações de terceiros</li>
                        <li>• <strong>Dados e estatísticas:</strong> Métricas que demonstram resultados</li>
                        <li>• <strong>Transparência:</strong> Informações claras sobre processos e políticas</li>
                        <li>• <strong>Segurança visível:</strong> Selos de segurança e proteção de dados</li>
                      </ul>
                    </div>

                    {/* Experiência do Usuário */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-purple-100">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Experiência do Usuário
                      </h4>
                      <ul className="text-gray-700 space-y-2 text-sm">
                        <li>• <strong>Jornada do usuário:</strong> Mapear todos os pontos de contato</li>
                        <li>• <strong>Feedback visual:</strong> Estados de loading, sucesso e erro</li>
                        <li>• <strong>Acessibilidade:</strong> WCAG compliance e navegação por teclado</li>
                        <li>• <strong>Performance otimizada:</strong> Tempos de carregamento reduzidos</li>
                        <li>• <strong>Personalização:</strong> Adaptação às preferências do usuário</li>
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Templates de Prompt para IA */}
                <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Templates de Prompt para IA
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-800 mb-2">🎨 Design/UX Review:</p>
                      <p className="font-mono text-sm text-gray-800 mb-2">
                        "Atue como um especialista sênior em UX/UI com mais de 20 anos de experiência. 
                        Analise esta interface de [TIPO_DO_SISTEMA] e reestruture-a para transmitir 
                        [VALORES_DESEJADOS: profissionalismo/confiança/modernidade]. 
                        Foque em [OBJETIVO_PRINCIPAL] para o público-alvo [PERSONA]."
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-800 mb-2">💻 Código/Arquitetura:</p>
                      <p className="font-mono text-sm text-gray-800 mb-2">
                        "Atue como um arquiteto de software sênior. Analise este código [LINGUAGEM/FRAMEWORK] 
                        e refatore seguindo princípios SOLID, Clean Architecture e best practices. 
                        Priorize [REQUISITOS: performance/manutenibilidade/escalabilidade]."
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <p className="font-semibold text-green-800 mb-2">📝 Documentação:</p>
                      <p className="font-mono text-sm text-gray-800 mb-2">
                        "Crie documentação técnica completa para [TIPO_DE_SISTEMA]. 
                        Inclua: arquitetura, APIs, deployment, troubleshooting. 
                        Público-alvo: [NÍVEL_TÉCNICO] com foco em [OBJETIVO_DA_DOC]."
                      </p>
                    </div>
                  </div>
                </div>

                {/* PRD e Princípios de Engenharia de Software */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    PRD e Princípios de Engenharia de Software
                  </h3>
                  
                  <div className="space-y-6">
                    
                    {/* Product Requirements Document */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <Database className="mr-2 h-4 w-4" />
                        Product Requirements Document (PRD)
                      </h4>
                      <div className="text-gray-700 space-y-3 text-sm">
                        <p><strong>Definição:</strong> Documento técnico que define o que será construído, por que será construído e como o sucesso será medido.</p>
                        <div className="bg-orange-50 p-3 rounded border-l-2 border-orange-300">
                          <p className="font-semibold text-orange-800 mb-2">Estrutura do PRD:</p>
                          <ul className="space-y-1">
                            <li>• <strong>Objetivos de Negócio:</strong> Métricas e KPIs esperados</li>
                            <li>• <strong>Personas e User Stories:</strong> Quem usará e como</li>
                            <li>• <strong>Requisitos Funcionais:</strong> O que o sistema deve fazer</li>
                            <li>• <strong>Requisitos Não-Funcionais:</strong> Performance, segurança, escalabilidade</li>
                            <li>• <strong>Critérios de Aceitação:</strong> Como validar o sucesso</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Princípio de Separação de Responsabilidades */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Separação de Responsabilidades (SRP)
                      </h4>
                      <div className="text-gray-700 space-y-3 text-sm">
                        <p><strong>Princípio:</strong> Cada módulo, classe ou função deve ter uma única responsabilidade bem definida.</p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded border border-green-200">
                            <p className="font-semibold text-green-800 mb-2">✅ Boas Práticas:</p>
                            <ul className="space-y-1 text-green-700">
                              <li>• Componentes com função única</li>
                              <li>• Separação de lógica de negócio</li>
                              <li>• APIs com endpoints específicos</li>
                              <li>• Validação separada da persistência</li>
                            </ul>
                          </div>
                          <div className="bg-red-50 p-3 rounded border border-red-200">
                            <p className="font-semibold text-red-800 mb-2">❌ Evitar:</p>
                            <ul className="space-y-1 text-red-700">
                              <li>• Componentes com múltiplas funções</li>
                              <li>• Misturar UI com lógica de dados</li>
                              <li>• Endpoints que fazem tudo</li>
                              <li>• Código duplicado entre módulos</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Princípios SOLID */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <Brain className="mr-2 h-4 w-4" />
                        Princípios SOLID
                      </h4>
                      <div className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="font-semibold text-gray-800 mb-2">S - Single Responsibility</p>
                            <p className="text-xs text-gray-600">Uma classe deve ter apenas uma razão para mudar</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 mb-2">O - Open/Closed</p>
                            <p className="text-xs text-gray-600">Aberto para extensão, fechado para modificação</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 mb-2">L - Liskov Substitution</p>
                            <p className="text-xs text-gray-600">Objetos derivados devem substituir seus tipos base</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 mb-2">I - Interface Segregation</p>
                            <p className="text-xs text-gray-600">Interfaces específicas são melhores que genéricas</p>
                          </div>
                          <div className="md:col-span-2">
                            <p className="font-semibold text-gray-800 mb-2">D - Dependency Inversion</p>
                            <p className="text-xs text-gray-600">Dependa de abstrações, não de implementações concretas</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arquitetura Limpa */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Arquitetura Limpa (Clean Architecture)
                      </h4>
                      <div className="text-gray-700 space-y-3 text-sm">
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="font-semibold text-blue-800 mb-2">Camadas da Arquitetura:</p>
                          <ul className="space-y-2">
                            <li><strong>1. Entidades:</strong> Regras de negócio centrais</li>
                            <li><strong>2. Casos de Uso:</strong> Regras de negócio da aplicação</li>
                            <li><strong>3. Adaptadores:</strong> Interface entre camadas</li>
                            <li><strong>4. Frameworks:</strong> UI, banco de dados, web</li>
                          </ul>
                        </div>
                        <p><strong>Regra de Dependência:</strong> Código em camadas internas não pode conhecer camadas externas.</p>
                      </div>
                    </div>

                    {/* Design Patterns Essenciais */}
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-orange-100">
                      <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Design Patterns Essenciais
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Repository Pattern</p>
                          <p className="text-xs text-gray-600">Abstração da camada de dados</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Factory Pattern</p>
                          <p className="text-xs text-gray-600">Criação de objetos sem exposer lógica</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Observer Pattern</p>
                          <p className="text-xs text-gray-600">Notificação automática de mudanças</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Strategy Pattern</p>
                          <p className="text-xs text-gray-600">Algoritmos intercambiáveis</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">Singleton Pattern</p>
                          <p className="text-xs text-gray-600">Instância única global</p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">MVC/MVP/MVVM</p>
                          <p className="text-xs text-gray-600">Separação UI/Lógica/Dados</p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Metodologias de Desenvolvimento */}
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Metodologias de Desenvolvimento
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-3">🚀 Metodologias Ágeis</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Scrum:</strong> Sprints de 1-4 semanas com retrospectivas</li>
                        <li>• <strong>Kanban:</strong> Fluxo contínuo com WIP limits</li>
                        <li>• <strong>User Stories:</strong> Como [persona], eu quero [funcionalidade]</li>
                        <li>• <strong>MVP:</strong> Produto mínimo viável primeiro</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold text-yellow-800 mb-3">🔧 DevOps & CI/CD</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• <strong>Version Control:</strong> Git flow com branches organizados</li>
                        <li>• <strong>Automated Testing:</strong> Unit, integration, e2e tests</li>
                        <li>• <strong>Deployment:</strong> Pipeline automatizado</li>
                        <li>• <strong>Monitoring:</strong> Logs, métricas e alertas</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Checklist Universal de Qualidade */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Checklist Universal de Qualidade
                  </h3>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">🎨 Design</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>☐ Identidade visual consistente</li>
                        <li>☐ Responsive design implementado</li>
                        <li>☐ Acessibilidade (WCAG) validada</li>
                        <li>☐ Performance otimizada</li>
                        <li>☐ UX testing realizado</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">⚙️ Funcionalidade</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>☐ Todos os requisitos atendidos</li>
                        <li>☐ Fluxos de usuário testados</li>
                        <li>☐ Tratamento de erros implementado</li>
                        <li>☐ Validações de entrada aplicadas</li>
                        <li>☐ APIs documentadas</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">🏗️ Arquitetura</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>☐ Princípios SOLID aplicados</li>
                        <li>☐ Design patterns utilizados</li>
                        <li>☐ Separação de responsabilidades</li>
                        <li>☐ Código limpo e documentado</li>
                        <li>☐ Testes automatizados</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">🚀 Produção</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>☐ Deploy automatizado</li>
                        <li>☐ Monitoramento ativo</li>
                        <li>☐ Backup estratégia definida</li>
                        <li>☐ Segurança implementada</li>
                        <li>☐ Documentação atualizada</li>
                      </ul>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Project Analyzer Tab */}
          <TabsContent value="ai-analyzer">
            <ProjectComplexityAnalyzer />
          </TabsContent>
        </Tabs>

        {/* Modal para criar novo pagamento */}
        <Dialog open={showCreatePlatformCost} onOpenChange={setShowCreatePlatformCost}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Novo Pagamento</DialogTitle>
            </DialogHeader>
            <Form {...platformCostForm}>
              <form onSubmit={platformCostForm.handleSubmit(handleCreatePlatformCost)} className="space-y-4">
                <FormField
                  control={platformCostForm.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plataforma</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 99Freelas, Workana..." {...field} />
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
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0,00" 
                          {...field} 
                        />
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
                        <Input placeholder="Ex: Julho 2025" {...field} />
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
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detalhes adicionais sobre o pagamento..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreatePlatformCost(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPlatformCostMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {createPlatformCostMutation.isPending ? 'Salvando...' : 'Registrar Pagamento'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}