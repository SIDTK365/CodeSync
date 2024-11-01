import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "antd";
import { CodeOutlined, PlusCircleOutlined } from "@ant-design/icons";
import GreenLaptop from '../assets/svg/GreenLaptop.svg';

function Home() {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const Id = uuid();
    setRoomId(Id);
    toast.success("Room Id is generated");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both fields are required");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username },
    });
    toast.success("Room is created");
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row min-h-screen items-center justify-center gap-16">
          {/* Left Section - Image */}
          <div className="lg:w-1/2 flex flex-col justify-center items-center">
            <img
              // src="https://illustrations.popsy.co/amber/pair-programming.svg"
              src={GreenLaptop}
              alt="Collaboration"
              className="w-4/5 max-w-lg"
            />
          </div>

          {/* Right Section - Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <div className="bg-[#212529] p-8 rounded-2xl shadow-xl">
              <div className="text-center mb-8">
                <div className="flex justify-center items-center mb-4 gap-3">
                  <CodeOutlined className="text-[#28a745] text-4xl" />
                  <h1 className="text-3xl font-bold text-white m-0">CodeSync</h1>
                </div>
              </div>
              
              <div className="space-y-6">
                <Input
                  size="large"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="ROOM ID"
                  onKeyUp={handleInputEnter}
                  style={{
                    backgroundColor: '#6c757d',
                    borderColor: '#6c757d',
                    color: 'white',
                  }}
                  className="hover:border-[#28a745] placeholder:text-gray-300"
                />

                <Input
                  size="large"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="USERNAME"
                  onKeyUp={handleInputEnter}
                  style={{
                    backgroundColor: '#6c757d',
                    borderColor: '#6c757d',
                    color: 'white',
                  }}
                  className="hover:border-[#28a745] placeholder:text-gray-300"
                />

                <Button
                  type="primary"
                  size="large"
                  onClick={joinRoom}
                  style={{
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                  }}
                  className="w-full h-12 text-lg hover:opacity-90"
                >
                  JOIN
                </Button>

                <div className="text-center text-white">
                  <button
                    onClick={generateRoomId}
                    className="inline-flex items-center text-[#28a745] hover:text-[#28a745]/90 font-medium gap-2"
                  >
                    <PlusCircleOutlined /> Generate Room ID
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
