

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Bell, Mail, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { EmailSettings, SystemSettings } from '@/types/index'

interface NotificationProps {
    setEmailSettings: React.Dispatch<React.SetStateAction<EmailSettings>>;
    emailSettings: EmailSettings;
    systemSettings: SystemSettings;
    setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>
}

const NotificationComponent: React.FC<NotificationProps> = ({ setEmailSettings, emailSettings, systemSettings, setSystemSettings }) => {

    const handleAddEmail = () => {
        if (emailSettings.testEmail && !emailSettings.recipients.includes(emailSettings.testEmail)) {
            setEmailSettings(prev => ({
                ...prev,
                recipients: [...prev.recipients, prev.testEmail],
                testEmail: ""
            }));
        }
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmailSettings(prev => ({
            ...prev,
            recipients: prev.recipients.filter(email => email !== emailToRemove)
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Mail className="h-5 w-5" />
                        <span>Configuración de Email</span>
                    </CardTitle>
                    <CardDescription>
                        Gestiona los destinatarios y configuración de notificaciones por email
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={emailSettings.enabled}
                            onChange={(e) => setEmailSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                            className="rounded"
                        />
                        <Label>Habilitar notificaciones por email</Label>
                    </div>

                    <div>
                        <Label className="block mb-1">Frecuencia de notificaciones</Label>
                        <Select
                            value={emailSettings.frequency}
                            onValueChange={(value) => setEmailSettings(prev => ({ ...prev, frequency: value }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar frecuencia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="immediate">Inmediata</SelectItem>
                                <SelectItem value="hourly">Cada hora</SelectItem>
                                <SelectItem value="daily">Diaria</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="block mb-1">Agregar destinatario</Label>
                        <div className="flex space-x-2">
                            <Input
                                type="email"
                                value={emailSettings.testEmail}
                                onChange={(e) => setEmailSettings(prev => ({ ...prev, testEmail: e.target.value }))}
                                placeholder="nuevo@email.com"
                                className="flex-1"
                            />
                            <Button
                                onClick={handleAddEmail}
                                variant={"outline"}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="bg-muted p-4">
                        <Label className="block mb-1">Destinatarios actuales</Label>
                        <div className="space-y-2 ">
                            {emailSettings.recipients.length > 0 ? (
                                emailSettings.recipients.map(email => (
                                    <div key={email} className="flex justify-between items-center px-6">
                                        <span className="text-sm">{email}</span>
                                        <Button
                                            variant="customdestructive"
                                            size="custom"
                                            className="gap-1"
                                            onClick={() => handleRemoveEmail(email)}
                                        >
                                            <Trash2 />
                                            Eliminar
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-foreground">No hay destinatarios configurados</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Bell className="h-5 w-5" />
                        <span>Configuración de Alertas</span>
                    </CardTitle>
                    <CardDescription>
                        Personaliza cómo se muestran y notifican las alertas en el sistema
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="block text-sm font-medium mb-2">Tiempo de enfriamiento para alertas</Label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={systemSettings.alertCooldown}
                                onChange={(e) => setSystemSettings(prev => ({ ...prev, alertCooldown: parseInt(e.target.value) }))}
                                className="w-full"
                            />
                            <span className="text-sm font-medium">{systemSettings.alertCooldown} minutos</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={systemSettings.enableSounds}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, enableSounds: e.target.checked }))}
                            className="rounded"
                        />
                        <Label>Habilitar sonidos de alerta</Label>
                    </div>

                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Prueba de notificaciones</AlertTitle>
                        <AlertDescription>
                            Puedes probar las notificaciones configuradas haciendo clic en el botón de prueba
                        </AlertDescription>
                    </Alert>

                    <Button variant="custom" size="custom" className="w-full gap-1">
                        Probar Notificaciones
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default NotificationComponent;