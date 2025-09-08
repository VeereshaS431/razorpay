
import "./chat.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [users, setUsers] = useState([]);
    const [groupTitle, setGroupTitle] = useState("");
    const [groupMembers, setGroupMembers] = useState([]);
    const [typingUsers, setTypingUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const messagesEndRef = useRef();
    const socketRef = useRef();

    const token = sessionStorage.getItem("token");
    const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const userId = decodedToken?.id;

    // Initialize socket connection
    useEffect(() => {
        if (!userId) return;

        console.log("Initializing socket for user:", userId);
        const socket = io("http://localhost:3000", { query: { userId: selectedConversation?.id } });
        socketRef.current = socket;

        socket.on("newMessage", (msg) => {
            console.log("New message received:", msg);

            setConversations((prev) =>
                prev.map((c) =>
                    c.id === msg.conversationId
                        ? {
                            ...c,
                            lastMessage: msg.text,
                            unread:
                                selectedConversation?.id === c.id
                                    ? 0
                                    : (c.unread || 0) + 1,
                        }
                        : c
                )
            );

            if (selectedConversation && msg.conversationId === selectedConversation.id) {
                setMessages((prev) => [...prev, msg]);
                socket.emit("readMessage", { messageId: msg.id });
                scrollToBottom();
            }
        });

        socket.on("typing", ({ userId: typingUser }) => {
            if (!typingUsers.includes(typingUser)) {
                setTypingUsers((prev) => [...prev, typingUser]);
                setTimeout(() => {
                    setTypingUsers((prev) => prev.filter((id) => id !== typingUser));
                }, 2000);
            }
        });

        return () => socket.disconnect();
    }, [selectedConversation, typingUsers, userId]);

    // Fetch all users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get("http://localhost:3000/api/user/getAllUsers");
                setUsers(res.data.users.filter((u) => u.id !== userId));
            } catch (err) {
                console.log(err);
            }
        };
        fetchUsers();
    }, [userId]);

    // Fetch conversations
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await axios.get("http://localhost:3000/api/conversations", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    // memberId:
                }
            });
            const convos = res.data.map((c) => ({
                ...c,
                lastMessage: c.Messages?.[0]?.text || "",
                unread: 0,
            }));
            setConversations(convos);
        } catch (err) {
            console.log(err);
        }
    };

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setPage(1);
        socketRef.current.emit("joinConversation", { conversationId: conversation.id });
        await loadMessages(conversation.id, 1);

        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversation.id ? { ...c, unread: 0 } : c
            )
        );
    };

    const loadMessages = async (conversationId, pageNumber = 1) => {
        try {
            const res = await axios.get(
                `http://localhost:3000/api/messages/${conversationId}?page=${pageNumber}&limit=20`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const msgs =
                pageNumber === 1 ? res.data.messages : [...res.data.messages, ...messages];
            setMessages(msgs);
            setPage(pageNumber);
            scrollToBottom();
        } catch (err) {
            console.log(err);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !selectedConversation) return;
        try {
            await axios.post(
                "http://localhost:3000/api/messages",
                { conversationId: selectedConversation.id, content: inputValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setInputValue("");
        } catch (err) {
            console.log(err);
        }
    };

    const handleTyping = () => {
        if (selectedConversation) {
            socketRef.current.emit("typing", {
                conversationId: selectedConversation.id,
            });
        }
    };

    const createGroup = async () => {
        if (!groupTitle || groupMembers.length === 0)
            return alert("Enter group title and select members");
        try {
            await axios.post(
                "http://localhost:3000/api/conversations/group",
                { title: groupTitle, memberIds: groupMembers },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setGroupTitle("");
            setGroupMembers([]);
            fetchConversations();
        } catch (err) {
            console.log(err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(
            () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
            100
        );
    };

    const startDM = async (targetUserId) => {
        try {
            const res = await axios.post(
                "http://localhost:3000/api/conversations/dm",
                { peerId: targetUserId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // If conversation already exists or new one created, open it
            const conversation = res.data;
            setSelectedConversation(conversation);

            // Fetch messages for this DM
            await loadMessages(conversation.id, 1);

            // Refresh conversation list
            fetchConversations();
        } catch (err) {
            console.log(err);
        }
    };

    console.log(conversations, "from usersss")

    return (
        <div className="chat-container">
            {/* Conversation List */}
            <div className="user-list">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3>Chat</h3>
                    <p style={{ cursor: "pointer" }} onClick={() => setShowGroupModal(true)}>Create Group</p>
                </div>
                <ul>
                    {conversations.map((conv) => (
                        <li
                            key={conv.id}
                            style={{
                                backgroundColor:
                                    selectedConversation?.id === conv.id ? "#d0e6ff" : "",
                            }}
                            onClick={() => selectConversation(conv)}
                        >
                            <strong>
                                {conv.type === "dm"
                                    ? conv.Users.find((u) => u.id != userId)?.Name
                                    : conv.title}
                            </strong>
                            <p className="last-message">{conv.lastMessage}</p>
                            {conv.unread > 0 && <span className="badge">{conv.unread}</span>}
                            {conv.type === "group" && (
                                <small>
                                    Members: {conv.Users.map((u) => u.Name).join(", ")}
                                </small>
                            )}
                        </li>
                    ))}
                </ul>
                <ul>
                    {users.map((u) => (
                        <li onClick={() => startDM(u.id)} key={u.id}>
                            {u.Name}
                        </li>
                    ))}
                </ul>
            </div>
            {/* Chat Area */}
            <div className="chat-area">
                <div className="header">
                    <h2>
                        {selectedConversation
                            ? selectedConversation.title || "Chat"
                            : "Select a conversation"}
                    </h2>
                    {selectedConversation?.type === "group" && (
                        <small>
                            Members: {selectedConversation.Users.map((u) => u.Name).join(", ")}
                        </small>
                    )}
                </div>

                <div className="messages">
                    {selectedConversation && (
                        <button
                            onClick={() => loadMessages(selectedConversation.id, page + 1)}
                            className="load-more"
                        >
                            Load More
                        </button>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`message ${msg.senderId === userId ? "own" : "other"}`}
                        >
                            {msg.senderId !== userId && (
                                <strong>{msg.senderName || "User"}: </strong>
                            )}
                            <p>{msg.text}</p>
                            <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                            {msg.status === "read" && msg.senderId === userId && (
                                <small> ✓ Read</small>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>

                <div className="input-container">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                        onInput={handleTyping}
                    />
                    <button onClick={handleSend}>Send</button>
                </div>
            </div>

            {showGroupModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Create Group</h3>
                        <input
                            type="text"
                            placeholder="Group Title"
                            value={groupTitle}
                            onChange={(e) => setGroupTitle(e.target.value)}
                        />
                        <div className="group-members">
                            {users.map((u) => (
                                <label key={u.id}>
                                    <input
                                        type="checkbox"
                                        value={u.id}
                                        checked={groupMembers.includes(u.id)}
                                        onChange={(e) => {
                                            if (e.target.checked)
                                                setGroupMembers([...groupMembers, u.id]);
                                            else
                                                setGroupMembers(groupMembers.filter((id) => id !== u.id));
                                        }}
                                    />
                                    {u.Name}
                                </label>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button onClick={createGroup}>Create</button>
                            <button onClick={() => setShowGroupModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;

