import { createContext, useCallback, useMemo, useState } from "react";
import * as RadixToast from "@radix-ui/react-toast";
import React from "react";
import "./toast.css"

export const ToastContext = createContext<ToastContextType>({
  open: false,
  toasts: [],
  addToast: () => null,
  toggleToast: () => null,
});

export type Toast = string;

export interface ToastContextType {
  open: boolean;
  toasts: Toast[];
  addToast?: (toast: Toast) => void;
  toggleToast?: () => void;
}

interface ToastProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
}
export const ToastComponent = ({ open, setOpen, title }: ToastProps) => {
  const eventDateRef = React.useRef(new Date());
  return (
    <RadixToast.Root className="ToastRoot" open={open} onOpenChange={setOpen}>
      <RadixToast.Title className="ToastTitle">
        {title || "empty"}
      </RadixToast.Title>
      <RadixToast.Description asChild>
        <time
          className="ToastDescription"
          dateTime={eventDateRef.current.toISOString()}
        >
          {prettyDate(eventDateRef.current)}
        </time>
      </RadixToast.Description>
      <RadixToast.Action
        className="ToastAction"
        asChild
        altText="Goto schedule to undo"
      >
        <div
          style={{ color: "green", fontSize: "12px", paddingLeft: "6px" }}
        >
          ❌
        </div>
      </RadixToast.Action>
    </RadixToast.Root>
  );
};

function prettyDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [open, setOpen] = useState(false);

  const addToast = useCallback((message: Toast) => {
    setToasts((state) => [...state, message]);
  }, []);
  const toggleToast = useCallback(() => {
    setOpen((state) => !state);
	if (toasts.length > 0) {
		setToasts([]);
	}
  }, [toasts.length]);

  const value = useMemo(
    () => ({
      addToast,
      toggleToast,
      toasts,
      open,
    }),
    [addToast, toggleToast, toasts, open]
  );

  return (
    <ToastContext.Provider value={value}>
      <RadixToast.Provider swipeDirection="right">
        {" "}
        {children}
		{
			toasts.map((toast) => {
				return <ToastComponent
					open={open}
					setOpen={toggleToast}
					title={toast}
				/>
			})

		}
        <RadixToast.Viewport className="ToastViewport" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};
