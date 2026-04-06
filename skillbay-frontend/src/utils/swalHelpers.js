import Swal from "sweetalert2";

const baseToast = {
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
  customClass: { popup: "swal-custom-toast" },
};

export function showSuccess(title, text = "") {
  return Swal.fire({
    ...baseToast,
    icon: "success",
    title,
    text,
  });
}

export function showError(title, text = "") {
  return Swal.fire({
    ...baseToast,
    icon: "error",
    title,
    text,
    timer: 4000,
  });
}

export function showWarning(title, text = "") {
  return Swal.fire({
    ...baseToast,
    icon: "warning",
    title,
    text,
    timer: 3500,
  });
}

export function showInfo(title, text = "") {
  return Swal.fire({
    ...baseToast,
    icon: "info",
    title,
    text,
  });
}

export function showConfirm(title, text = "", confirmText = "Confirmar") {
  return Swal.fire({
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });
}

export function showInputModal({
  title,
  inputLabel,
  inputPlaceholder,
  confirmText = "Enviar",
  inputType = "textarea",
  maxLength = 2000,
  required = true,
  minLength = 1,
}) {
  return Swal.fire({
    title,
    input: inputType,
    inputLabel,
    inputPlaceholder,
    inputAttributes: { maxlength: String(maxLength) },
    showCancelButton: true,
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    preConfirm: (value) => {
      const text = String(value || "").trim();
      if (required && !text) {
        Swal.showValidationMessage("Este campo es obligatorio.");
        return false;
      }
      if (minLength > 1 && text.length < minLength) {
        Swal.showValidationMessage(`Debe tener al menos ${minLength} caracteres.`);
        return false;
      }
      return text;
    },
  });
}

export function showLoading(title = "Procesando...") {
  return Swal.fire({
    title,
    html: '<div class="flex justify-center"><div class="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div></div>',
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });
}

export function dismissLoading() {
  if (Swal.isVisible()) {
    Swal.close();
  }
}
