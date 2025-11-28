// Exporta el componente principal
export { UploadForm } from "./upload-form";

// Exporta componentes de formulario
export { FormField, FormTextarea, ResponsableArrayField, FormArrayItem } from "./form-components";

// Exporta componentes de UI
export { StepIndicator, NavigationButtons } from "./step-indicator";
export { ZipUploadSection } from "./zip-upload-section";
export { StepContent, FormStep1, FormStep2, FormStep3, FormStep4, FormStep5 } from "./form-steps";

// Exporta esquemas de validación
export {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  fullSchema,
  stepSchemas,
} from "./validation-schemas";

// Exporta el hook
export { useUploadFormLogic } from "./use-upload-form-logic";
