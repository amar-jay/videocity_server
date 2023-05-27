import  { useContext, useEffect, useMemo } from "react";
import { ToolTip } from "../components/tooltip";
import { ToastContext } from "../components/toast";
import { useNavigate } from "react-router-dom";

interface LinkPageProps {
  status?: string;
//   link: string;
}
export function CopyLink({ status, }: LinkPageProps) {
  const link = new URL(window.location.href).searchParams.get("redirect_url") || "";
  const redirect = useNavigate();
  const toastContext = useContext(ToastContext);
  // eslint-disable-next-line no-useless-escape
  const urlPattern = useMemo(() => /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/, []);
  const copyLink = () => {
    navigator.clipboard.writeText(link);
    // alert("Copied to clipboard");
	toastContext.toggleToast?.();
	toastContext.addToast?.("Copied to clipboard")
  };

  const shareLink = () => {
    navigator.share({
      title: "VideoCity",
      text: "Join my VideoCity room",
      url: link,
    });
  };

  useEffect(() => {
	if (link === "" || !urlPattern.test(link)) {
		redirect("/error?message=link is absent or wrong");
	}
	}, [link, redirect, urlPattern]);

  return (
    <div>
      <h1>
        Video<span>City</span>
      </h1>
      <div
        style={{
          paddingLeft: "5px",
          fontSize: "13px",
          paddingTop: "10px",
          paddingBottom: "10px",
        }}
      />
      <ToolTip tooltiptext={"click to copy"}>
        <div>
          <input
            className="copyText"
            onClick={copyLink}
            value={link}
            readOnly
          />
        </div>
      </ToolTip>
      <div className="card">
        <button onClick={shareLink} disabled={status !== "connected"}>
          Share Link
        </button>
      </div>
      <p className="read-the-docs">
        By amar-jay |{" "}
        <a href="https://github.com/amar-jay" target="_blank">
          Github
        </a>
      </p>
    </div>
  );
}
