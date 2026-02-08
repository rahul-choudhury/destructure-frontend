import { Input } from "./input"
import { Label } from "./label"
import { Error } from "./error"

export type FieldProps = React.HTMLAttributes<HTMLDivElement>

export function Field(props: FieldProps) {
  return <div className="flex flex-col items-start gap-1.5" {...props} />
}

Field.Label = Label
Field.Input = Input
Field.Error = Error
