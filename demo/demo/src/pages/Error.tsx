
export const Error = (
) => {

  const message = new URL(window.location.href).searchParams.get("message") || "page is not present";
  return (
    <div className="flex items-center justify-center gap-3 flex-col">
      <h1>Oops!!</h1>
      <span className="read-the-docs">{message}</span>
    </div>
  );
};
