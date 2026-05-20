interface Props {
  onClick: () => void;
  loading: boolean;
}

export function ExportButton({
  onClick,
  loading,
}: Props) {

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
        mt-6
        rounded-2xl
        bg-blue-600
        px-6
        py-4
        font-semibold
        transition
        hover:bg-blue-500
        disabled:opacity-50
      "
    >
      {
        loading
          ? "Procesando..."
          : "Recortar video"
      }
    </button>
  );
}