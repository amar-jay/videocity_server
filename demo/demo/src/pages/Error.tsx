interface ErrorProps {
  message: string;
}

export const Error = (
  { message }: ErrorProps = { message: "Page not found" }
) => {
  return (
    <div className="flex items-center justify-center gap-3 flex-col">
      <h1>Oops!!</h1>
      <span className="read-the-docs">{message}</span>
    </div>
  );
};
