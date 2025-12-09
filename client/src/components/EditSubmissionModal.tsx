import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface EditSubmissionModalProps {
  isOpen: boolean;
  submission: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditSubmissionModal({
  isOpen,
  submission,
  onClose,
  onSuccess,
}: EditSubmissionModalProps) {
  const [formData, setFormData] = useState(submission || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMutation = trpc.admin.updateSubmission.useMutation({
    onSuccess: () => {
      toast.success("Submissão atualizada com sucesso!");
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar submissão");
    },
  });

  useEffect(() => {
    if (submission) {
      setFormData(submission);
      setErrors({});
    }
  }, [submission, isOpen]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (formData.cpf && formData.cpf.replace(/\D/g, "").length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate({
      id: formData.id,
      ...formData,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Submissão</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
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
              <Label htmlFor="telefone" className="text-foreground">
                Telefone
              </Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone || ""}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-foreground">
                CPF
              </Label>
              <Input
                id="cpf"
                type="text"
                value={formData.cpf || ""}
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
              <Label htmlFor="dataNascimento" className="text-foreground">
                Data Nascimento
              </Label>
              <Input
                id="dataNascimento"
                type="text"
                placeholder="DD/MM/AAAA"
                value={formData.dataNascimento || ""}
                onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomePai" className="text-foreground">
                Nome do Pai
              </Label>
              <Input
                id="nomePai"
                type="text"
                value={formData.nomePai || ""}
                onChange={(e) => handleInputChange("nomePai", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nomeMae" className="text-foreground">
                Nome da Mãe
              </Label>
              <Input
                id="nomeMae"
                type="text"
                value={formData.nomeMae || ""}
                onChange={(e) => handleInputChange("nomeMae", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agencia" className="text-foreground">
                Agência
              </Label>
              <Input
                id="agencia"
                type="text"
                value={formData.agencia || ""}
                onChange={(e) => handleInputChange("agencia", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conta" className="text-foreground">
                Conta
              </Label>
              <Input
                id="conta"
                type="text"
                value={formData.conta || ""}
                onChange={(e) => handleInputChange("conta", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rua" className="text-foreground">
                Rua
              </Label>
              <Input
                id="rua"
                type="text"
                value={formData.rua || ""}
                onChange={(e) => handleInputChange("rua", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero" className="text-foreground">
                Número
              </Label>
              <Input
                id="numero"
                type="text"
                value={formData.numero || ""}
                onChange={(e) => handleInputChange("numero", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bairro" className="text-foreground">
                Bairro
              </Label>
              <Input
                id="bairro"
                type="text"
                value={formData.bairro || ""}
                onChange={(e) => handleInputChange("bairro", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-foreground">
                Cidade
              </Label>
              <Input
                id="cidade"
                type="text"
                value={formData.cidade || ""}
                onChange={(e) => handleInputChange("cidade", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado" className="text-foreground">
                Estado
              </Label>
              <Input
                id="estado"
                type="text"
                maxLength={2}
                value={formData.estado || ""}
                onChange={(e) => handleInputChange("estado", e.target.value.toUpperCase())}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cep" className="text-foreground">
                CEP
              </Label>
              <Input
                id="cep"
                type="text"
                value={formData.cep || ""}
                onChange={(e) => handleInputChange("cep", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sentBy" className="text-foreground">
                Enviado por
              </Label>
              <Input
                id="sentBy"
                type="text"
                value={formData.sentBy || ""}
                onChange={(e) => handleInputChange("sentBy", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limitReturned" className="text-foreground">
                Limite Retornado
              </Label>
              <Input
                id="limitReturned"
                type="number"
                value={formData.limitReturned || 0}
                onChange={(e) => handleInputChange("limitReturned", parseFloat(e.target.value))}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate" className="text-foreground">
                Taxa de Comissão (%)
              </Label>
              <Input
                id="commissionRate"
                type="number"
                value={formData.commissionRate || 0}
                onChange={(e) => handleInputChange("commissionRate", parseFloat(e.target.value))}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Categoria
              </Label>
              <Input
                id="category"
                type="text"
                value={formData.category || ""}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
            className="bg-[oklch(0.65_0.18_195)] hover:bg-[oklch(0.60_0.18_195)]"
          >
            {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
