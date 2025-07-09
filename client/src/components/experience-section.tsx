import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Code, 
  Shield, 
  CreditCard, 
  Brain, 
  Database, 
  Cloud, 
  Smartphone,
  Trophy,
  TrendingUp,
  Users
} from "lucide-react";

export default function ExperienceSection() {
  const skills = {
    frontend: ["React.js", "Vue.js", "HTML5", "CSS3", "JavaScript"],
    backend: ["Python", "Node.js", "PHP", "Django", "Flask", "Laravel"],
    database: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
    auth: ["OAuth 2.0", "JWT", "Firebase Auth", "AWS Cognito"],
    payments: ["Mercado Pago", "Stripe", "PayPal"],
    devops: ["AWS", "Docker", "GitHub Actions"],
    ai: ["TensorFlow", "PyTorch", "OpenCV", "ChatGPT", "Hugging Face"]
  };

  const projects = [
    {
      title: "Sistema de Fidelidade - Clínica de Saúde",
      stack: "React + Node.js + PostgreSQL + Mercado Pago",
      description: "Mensalidades com descontos progressivos e alertas via WhatsApp",
      impact: "90% de automação de processos manuais",
      category: "Saúde"
    },
    {
      title: "Plataforma de Assinaturas - Cursos Online",
      stack: "Django + Vue.js + Stripe",
      description: "Tokens temporários para conteúdos exclusivos e gestão de trials",
      impact: "15% de aumento na conversão",
      category: "Educação"
    },
    {
      title: "Sistema de Autenticação Empresarial",
      stack: "Python + OAuth 2.0 + AWS Cognito",
      description: "2FA, bloqueio de IPs suspeitos e conformidade LGPD",
      impact: "100% de conformidade regulatória",
      category: "Segurança"
    }
  ];

  const expertise = [
    {
      icon: Shield,
      title: "Sistemas de Autenticação Segura",
      description: "OAuth 2.0, JWT, 2FA e conformidade LGPD/HIPAA",
      color: "text-blue-600"
    },
    {
      icon: CreditCard,
      title: "Gestão de Pagamentos",
      description: "Cobrança recorrente, dunning e upgrade/downgrade automático",
      color: "text-green-600"
    },
    {
      icon: Brain,
      title: "Inteligência Artificial",
      description: "ML, NLP, visão computacional e automação de fluxos",
      color: "text-purple-600"
    },
    {
      icon: Code,
      title: "Desenvolvimento Full-Stack",
      description: "APIs REST, microsserviços e frontend responsivo",
      color: "text-orange-600"
    }
  ];

  const achievements = [
    { metric: "30%", description: "Redução em falhas de pagamento" },
    { metric: "25%", description: "Aumento na retenção de assinantes" },
    { metric: "90%", description: "Automação de processos manuais" },
    { metric: "15%", description: "Melhoria na conversão" }
  ];

  return (
    <section id="experiencia" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Experiência Profissional
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Desde 2015 desenvolvendo soluções robustas em Python, PHP, React e JavaScript. 
            Especialista em sistemas críticos de autenticação, pagamentos e IA.
          </p>
        </div>

        {/* Areas de Especialização */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {expertise.map((area, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <area.icon className={`w-12 h-12 mx-auto mb-4 ${area.color}`} />
                <h3 className="font-semibold text-lg mb-2">{area.title}</h3>
                <p className="text-gray-600 text-sm">{area.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resultados Alcançados */}
        <Card className="mb-16 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
              Resultados Comprovados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {achievement.metric}
                  </div>
                  <p className="text-gray-600 text-sm">{achievement.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projetos Destaque */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Projetos de Destaque
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <Badge variant="outline">{project.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">{project.stack}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  <div className="flex items-center text-green-600 font-semibold">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {project.impact}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stack Tecnológico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Code className="w-6 h-6 mr-2 text-blue-600" />
              Stack Tecnológico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center mb-3">
                <Smartphone className="w-5 h-5 mr-2 text-blue-600" />
                <h4 className="font-semibold">Frontend</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.frontend.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center mb-3">
                <Database className="w-5 h-5 mr-2 text-green-600" />
                <h4 className="font-semibold">Backend & Databases</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...skills.backend, ...skills.database].map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                <h4 className="font-semibold">Autenticação & Pagamentos</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...skills.auth, ...skills.payments].map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center mb-3">
                <Brain className="w-5 h-5 mr-2 text-orange-600" />
                <h4 className="font-semibold">IA & DevOps</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {[...skills.ai, ...skills.devops].map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diferenciais */}
        <Card className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Users className="w-6 h-6 mr-2 text-indigo-600" />
              Diferenciais Competitivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-indigo-700">Especialização em Sistemas Críticos</h4>
                <p className="text-gray-700">Experiência sólida em saúde e pagamentos, com foco em segurança e conformidade regulatória.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-indigo-700">Híbrido Tradicional + IA</h4>
                <p className="text-gray-700">Combinação única de desenvolvimento clássico com soluções avançadas de inteligência artificial.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-indigo-700">Arquiteturas Escaláveis</h4>
                <p className="text-gray-700">Capacidade de traduzir regras de negócio complexas em soluções técnicas robustas e escaláveis.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-indigo-700">Impacto Mensurável</h4>
                <p className="text-gray-700">Foco em resultados quantificáveis que geram valor real para o negócio dos clientes.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}