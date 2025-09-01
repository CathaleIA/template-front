import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CardItemProps {
  nameFile: string
  date: string
  estado: string
  pool_user_id: string
  lote: string
}

const CardItem = ({ nameFile, date, estado, pool_user_id, lote }: CardItemProps) => {


  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-foreground truncate">{nameFile}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Fecha:</span>
            <p className="text-foreground">{new Date(date).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Pool ID:</span>
            <p className="text-foreground truncate">{pool_user_id}</p>
          </div>
        </div>
        <div>
          <span className="font-medium text-muted-foreground">Lote:</span>
          <p className="text-foreground font-mono text-xs truncate">{lote}</p>
        </div>
        <div>
          <p>{estado}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default CardItem