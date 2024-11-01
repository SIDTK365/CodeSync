import React, { useEffect, useRef, useState } from "react";
import Client from "./Client";
import Editor from "./Editor";
import { initSocket } from "../Socket";
import { ACTIONS } from "../Actions";
import {
  useNavigate,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Button, ConfigProvider, Select, Drawer } from 'antd';
import { 
  CopyOutlined, 
  LogoutOutlined, 
  CodeOutlined, 
  CloseOutlined, 
  PlayCircleOutlined, 
  LoadingOutlined,
  ClearOutlined
} from '@ant-design/icons';

// List of supported languages
const LANGUAGES = [
  "python3",
  "java",
  "cpp",
  "nodejs",
  "c",
  "ruby",
  "go",
  "scala",
  "bash",
  "sql",
  "pascal",
  "csharp",
  "php",
  "swift",
  "rust",
  "r",
];

const THEMES = [
  "dracula",
  "monokai",
  "material",
  "material-darker",
  "material-palenight",
  "nord",
  "cobalt",
  "oceanic-next"
];

function EditorPage() {
  const [clients, setClients] = useState([]);
  const [output, setOutput] = useState("");
  const [isCompileWindowOpen, setIsCompileWindowOpen] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("python3");
  const [selectedTheme, setSelectedTheme] = useState("dracula");
  const codeRef = useRef(null);

  const Location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const socketRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      const handleErrors = (err) => {
        console.log("Error", err);
        toast.error("Socket connection failed, Try again later");
        navigate("/");
      };

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: Location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== Location.state?.username) {
            toast.success(`${username} joined the room.`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });
    };
    init();

    return () => {
      socketRef.current && socketRef.current.disconnect();
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
    };
  }, []);

  if (!Location.state) {
    return <Navigate to="/" />;
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success(`Room ID is copied`);
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy the room ID");
    }
  };

  const leaveRoom = async () => {
    navigate("/");
  };

  const runCode = async () => {
    setIsCompiling(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/compile`, {
        code: codeRef.current,
        language: selectedLanguage,
      });
      console.log("Backend response:", response.data);
      setOutput(response.data.output || JSON.stringify(response.data));
    } catch (error) {
      console.error("Error compiling code:", error);
      setOutput(error.response?.data?.error || "An error occurred");
    } finally {
      setIsCompiling(false);
    }
  };

  const toggleCompileWindow = () => {
    setIsCompileWindowOpen(!isCompileWindowOpen);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#28a745',
          colorError: '#dc3545',
        },
      }}
    >
      <div className="min-h-screen flex">
        {/* Client panel */}
        <div className="w-1/6 bg-[#212529] text-white flex flex-col p-4">
          <div className="flex items-center gap-3 mb-6">
            <CodeOutlined className="text-[#28a745] text-2xl" />
            <h1 className="text-xl font-bold text-white m-0">CodeSync</h1>
          </div>

          {/* Client list container */}
          <div className="flex-grow overflow-auto">
            <span className="text-gray-300 mb-4 block">Members</span>
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>

          {/* Buttons */}
          <div className="mt-auto space-y-2">
            <Button
              type="primary"
              block
              icon={<CopyOutlined />}
              onClick={copyRoomId}
              className="h-10"
            >
              Copy Room ID
            </Button>

            <Button
              type="primary"
              block
              danger
              icon={<LogoutOutlined />}
              onClick={leaveRoom}
              className="h-10"
            >
              Leave Room
            </Button>
          </div>
        </div>

        {/* Editor panel */}
        <div className="flex-grow flex flex-col">
          {/* Language selector */}
          <div className="bg-[#212529] p-3 flex justify-end gap-2">
            <Select
              value={selectedLanguage}
              onChange={setSelectedLanguage}
              style={{ width: 120 }}
              options={LANGUAGES.map(lang => ({
                value: lang,
                label: lang,
              }))}
              showSearch
              className="bg-[#6c757d]"
            />

            <Select
              value={selectedTheme}
              onChange={setSelectedTheme}
              style={{ width: 120 }}
              options={THEMES.map(theme => ({
                value: theme,
                label: theme,
              }))}
              showSearch
              className="bg-[#6c757d]"
            />
          </div>
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
            language={selectedLanguage}
            theme={selectedTheme}
          />
        </div>

        {/* Compiler toggle button */}
        <Button
          type="primary"
          size="large"
          icon={<CodeOutlined />}
          onClick={toggleCompileWindow}
          className="fixed bottom-4 right-4 z-50 h-12"
        >
          {isCompileWindowOpen ? "Close Compiler" : "Open Compiler"}
        </Button>

        {/* Compiler section */}
        <Drawer
          open={isCompileWindowOpen}
          onClose={toggleCompileWindow}
          placement="bottom"
          height="30vh"
          headerStyle={{ display: 'none' }}
          contentWrapperStyle={{
            backgroundColor: '#212529'
          }}
          // Add these props for consistent styling
          className="text-white"
          style={{
            backgroundColor: '#1e1e1e'  // Same as our main background
          }}
          drawerStyle={{
            backgroundColor: '#212529'  // Same as our dark sections
          }}
          maskStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)'  // Darker overlay
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h5 className="m-0 text-white">Compiler Output ({selectedLanguage})</h5>
            <div className="flex gap-2">
              <Button
                type="primary"
                icon={isCompiling ? <LoadingOutlined /> : <PlayCircleOutlined />}
                onClick={runCode}
                disabled={isCompiling}
                loading={isCompiling}
              >
                {isCompiling ? "Compiling..." : "Run Code"}
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={() => setOutput("")}
                className="text-white"
                style={{ borderColor: '#6c757d', backgroundColor: '#6c757d' }}
              >
                Clear
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={toggleCompileWindow}
                className="text-white"
                style={{ borderColor: '#6c757d', backgroundColor: '#6c757d' }}
              >
                Close
              </Button>
            </div>
          </div>
          <pre className="bg-[#6c757d] p-3 rounded text-white min-h-[100px] overflow-auto">
            {output || "Output will appear here after compilation"}
          </pre>
        </Drawer>

      </div>
    </ConfigProvider>
  );
}

export default EditorPage;
