import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Settings, Users } from "lucide-react";

import { EmailSettings, SystemSettings } from '@/types/index'
import { useUser } from "@/context/UserContext"
import { Badge } from "@/components/ui/badge";

interface SystemProps {
    systemSettings: SystemSettings;
    setSystemSettings: React.Dispatch<React.SetStateAction<SystemSettings>>
}

const SystemComponent: React.FC<SystemProps> = ({ systemSettings, setSystemSettings }) => {

    const { userr } = useUser();
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="card-generic">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Configuración del Sistema</span>
                    </CardTitle>
                    <CardDescription>
                        Ajustes generales del sistema y preferencias de rendimiento
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label className="block text-sm font-medium mb-2">Intervalo de actualización (segundos)</Label>
                        <Input
                            type="number"
                            min="5"
                            max="300"
                            value={systemSettings.refreshInterval}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                        />
                    </div>

                    <div>
                        <Label className="block text-sm font-medium mb-2">Retención de historial (días)</Label>
                        <Input
                            type="number"
                            min="1"
                            max="365"
                            value={systemSettings.historyRetention}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, historyRetention: parseInt(e.target.value) }))}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={systemSettings.enableSounds}
                            onChange={(e) => setSystemSettings(prev => ({ ...prev, enableSounds: e.target.checked }))}
                            className="rounded"
                        />
                        <Label>Habilitar sonidos del sistema</Label>
                    </div>
                </CardContent>
            </Card>

            <Card className="card-generic">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>Accesos y Permisos</span>
                    </CardTitle>
                    <CardDescription>
                        Gestiona los usuarios con acceso al sistema y sus permisos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Alert className="border-none rounded-xs">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Funcionalidad en desarrollo</AlertTitle>
                            <AlertDescription>
                                La gestión de usuarios estará disponible en la próxima versión
                            </AlertDescription>
                        </Alert>

                        <Alert className="p-4 rounded-xs border-none">
                            <h4 className="font-medium mb-3 text-foreground">Usuario actual</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <div>
                                        <p className="font-medium text-foreground">{userr?.email}</p>
                                        <p className="text-sm text-muted-foreground">{userr?.userRole}</p>
                                    </div>
                                    <Badge variant="outline">Activo</Badge>
                                </div>
                            </div>
                        </Alert>

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SystemComponent