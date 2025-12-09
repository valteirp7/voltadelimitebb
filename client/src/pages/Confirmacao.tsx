import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Confirmacao() {
  return (
    <div className="min-h-screen bg-gradient-cinematic relative overflow-hidden flex items-center justify-center">
      {/* Geometric accents */}
      <div className="absolute top-0 left-0 w-full h-1 accent-line-cyan" />
      <div className="absolute bottom-0 right-0 w-full h-1 accent-line-orange" />
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[oklch(0.65_0.18_195/0.1)] blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[oklch(0.7_0.15_55/0.1)] blur-3xl" />
      
      {/* Success glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[oklch(0.65_0.18_195/0.15)] blur-[100px]" />
      
      <div className="container relative z-10">
        <Card className="max-w-lg mx-auto glass-card glow-cyan border-0 overflow-hidden">
          <CardContent className="p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-[oklch(0.65_0.18_195/0.2)] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[oklch(0.65_0.18_195/0.3)] flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-[oklch(0.7_0.15_195)]" />
                </div>
              </div>
              {/* Animated rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-2 border-[oklch(0.65_0.18_195/0.3)] animate-ping" style={{ animationDuration: '2s' }} />
              </div>
            </div>
            
            {/* Success Message */}
            <h1 className="text-2xl md:text-3xl font-bold text-white text-shadow-depth mb-4">
              Formulário Enviado!
            </h1>
            
            <p className="text-muted-foreground text-lg mb-2">
              Seus dados foram recebidos com sucesso.
            </p>
            
            <p className="text-muted-foreground mb-8">
              Entraremos em contato em breve através do email informado.
            </p>
            
            {/* Decorative line */}
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-12 h-1 accent-line-cyan rounded-full" />
              <div className="w-12 h-1 accent-line-orange rounded-full" />
            </div>
            
            {/* Submission details */}
            <div className="bg-input/30 rounded-lg p-4 mb-8 border border-border/50">
              <p className="text-sm text-muted-foreground">
                Data de envio
              </p>
              <p className="text-foreground font-medium">
                {new Date().toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            {/* Back button */}
            <Link href="/">
              <Button
                variant="outline"
                className="border-border hover:bg-secondary text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
