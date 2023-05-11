import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface IndexProps {
  status?: string;
}
function Index({ status }: IndexProps) {
  const [errorText] = useState<string | null>(null);
  const navigate = useNavigate();
  return (
    <>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1>
        Video<span>City</span>
      </h1>
      <div style={{ borderWidth: "5px", borderColor: "#f00000" }}>
        <input
          type="text"
          placeholder="Room ID"
          style={{
            paddingLeft: "5px",
            fontSize: "13px",
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        />
        {errorText && <p style={{ color: "red" }}>{errorText}</p>}
        <h3 style={{ marginBottom: "1rem", textDecoration: "underline" }}>
          Permissions
        </h3>
        <label htmlFor="video">Video</label>
        <input type="checkbox" id="video" name="video" value="video" />
        <div style={{ marginTop: ".5rem" }} />
        <label htmlFor="audio">Audio</label>
        <input type="checkbox" id="audio" name="audio" value="audio" />
        <div style={{ marginTop: ".5rem" }} />
        <label htmlFor="video">Screen</label>
        <input type="checkbox" id="screen" name="screen" value="screen" />
        <div style={{ marginTop: ".5rem" }} />
      </div>
      <div className="card">
        <button onClick={() => navigate("/demo")} disabled={status !== "connected"}>
          Join Room
        </button>
      </div>
      <p className="read-the-docs">
        By amar-jay |{" "}
        <a href="https://github.com/amar-jay" target="_blank">
          Github
        </a>
      </p>
    </>
  );
}

export default Index;
