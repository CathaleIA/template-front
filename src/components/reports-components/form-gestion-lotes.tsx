"use client"

import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface FormValues {
    job_id: string
}

function FormGestionLotes(initialValues: FormValues) {
    const form = useForm<FormValues>({
        defaultValues: initialValues,
    })

    const onSubmit = (values: FormValues) => {
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="job_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job ID</FormLabel>
                            <FormControl>
                                <Input {...field} className="w-96" />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                                Ingresa el ID del trabajo para filtrar y seleccionar el lote de anexos
                                que deseas gestionar para su posterior procesamiento.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Guardar</Button>
            </form>
        </Form>
    )
}

export default FormGestionLotes
