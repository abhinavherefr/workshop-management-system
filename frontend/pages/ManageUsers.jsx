import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../src/context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { jwtDecode } from "jwt-decode";

const ROLE_THEME = {
  admin: {
    badge: "bg-red-500/10 text-red-400 border-red-500/30",
    dot: "bg-red-400",
    ring: "border-red-500/40",
    tint: "rgba(239,68,68,0.10)",
    text: "#f87171",
    accent: "bg-red-400",
  },
  technician: {
    badge: "bg-green-500/10 text-green-400 border-green-500/30",
    dot: "bg-green-400",
    ring: "border-green-500/40",
    tint: "rgba(34,197,94,0.10)",
    text: "#4ade80",
    accent: "bg-green-400",
  },
  receptionist: {
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    dot: "bg-blue-400",
    ring: "border-blue-500/40",
    tint: "rgba(59,130,246,0.10)",
    text: "#60a5fa",
    accent: "bg-blue-400",
  },
};

const themeFor = (role) => ROLE_THEME[role] || ROLE_THEME.receptionist;

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({ name, role }) => {
  const t = themeFor(role);
  return (
    <div
      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs shrink-0 border ${t.ring}`}
      style={{ backgroundColor: t.tint, color: t.text }}
    >
      {getInitials(name)}
    </div>
  );
};

const inputClass =
  "bg-[#0a0d12] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-white/20 focus:ring-2 focus:ring-white/5 transition-all duration-200 w-full";
const labelClass = "text-xs text-gray-500 tracking-wide mb-1.5 block";

const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-0">
    <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-32 bg-white/5 rounded animate-pulse"></div>
      <div className="h-3 w-44 bg-white/5 rounded animate-pulse"></div>
    </div>
    <div className="h-6 w-24 bg-white/5 rounded-full animate-pulse hidden md:block"></div>
    <div className="h-3 w-20 bg-white/5 rounded animate-pulse hidden md:block"></div>
  </div>
);

const AddUserModal = ({ open, onClose, onCreated }) => {
  const { backendurl, token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("receptionist");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setName(""); setEmail(""); setPassword(""); setRole("receptionist"); setError("");
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
      setError("Fill all fields correctly — password needs 8+ characters.");
      return;
    }
    setError("");

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${backendurl}/api/user/register`,
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("User created successfully");
        onCreated();
        close();
      } else {
        toast.error(response.data.message || "Failed to create user");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#11151c] border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-base text-white mb-5">Add user</h3>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className={labelClass}>Full name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Enter full name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="name@workshop.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Minimum 8 characters" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {["receptionist", "technician", "admin"].map((r) => {
                    const t = themeFor(r);
                    const active = role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`py-2.5 rounded-xl text-xs capitalize border transition-all duration-150 ${active ? `${t.badge} border` : "bg-[#0a0d12] border-white/10 text-gray-500 hover:text-gray-300"
                          }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 py-2.5 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl text-sm text-white py-2.5 transition-colors duration-200 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2"
                >
                  {submitting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>}
                  {submitting ? "Creating..." : "Create user"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DeleteUserModal = ({ user, onCancel, onConfirm, deleting }) => (
  <AnimatePresence>
    {user && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#11151c] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
        >
          <h3 className="text-base text-white mb-1">Remove user?</h3>
          <p className="text-gray-500 text-sm mb-5">
            This action cannot be undone. <span className="text-gray-400">{user.name}</span> will lose access immediately.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 py-2.5 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-xl text-sm py-2.5 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting && <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin"></span>}
              {deleting ? "Removing..." : "Remove"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ManageUsers = () => {
  const { backendurl, token } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Decode the current user's id from the JWT so we know which row is "you"
  const currentUserId = useMemo(() => {
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      return decoded.id || decoded._id || decoded.userId || null;
    } catch {
      return null;
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (user) => {
    if (user._id === currentUserId) {
      toast.error("You can't remove your own account");
      return;
    }
    setUserToDelete(user);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    // Safety net in case state somehow got out of sync
    if (userToDelete._id === currentUserId) {
      toast.error("You can't remove your own account");
      setUserToDelete(null);
      return;
    }

    try {
      setDeleting(true);
      const response = await axios.delete(`${backendurl}/api/user/${userToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
        toast.success("User removed");
        setUserToDelete(null);
      } else {
        toast.error(response.data.message || "Failed to remove user");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // "You" always pinned to the top of the list, regardless of sort/filter order
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      if (a._id === currentUserId) return -1;
      if (b._id === currentUserId) return 1;
      return 0;
    });
  }, [filteredUsers, currentUserId]);

  const counts = useMemo(() => ({
    total: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    technician: users.filter((u) => u.role === "technician").length,
    receptionist: users.filter((u) => u.role === "receptionist").length,
  }), [users]);

  const statCards = [
    { key: "all", label: "Total users", count: counts.total, color: "white" },
    { key: "admin", label: "Admins", count: counts.admin, color: "red" },
    { key: "technician", label: "Technicians", count: counts.technician, color: "green" },
    { key: "receptionist", label: "Receptionists", count: counts.receptionist, color: "blue" },
  ];

  return (
    <motion.div
      className="min-h-screen bg-[#0a0d12] text-white p-6 sm:p-10 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/[0.06] rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-60 right-1/4 w-[400px] h-[400px] bg-orange-500/[0.04] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">

        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl tracking-tight">Manage users</h1>
              <div className="bg-gradient-to-r from-blue-500 to-transparent h-[2px] w-12 hidden sm:block"></div>
            </div>
            <p className="text-gray-500 text-sm mt-1">View and manage registered staff accounts</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)}
            className="bg-orange-600 hover:bg-orange-700 transition-colors duration-200 px-5 py-2.5 rounded-xl text-sm shadow-lg shadow-orange-600/20 flex items-center gap-2"
          >
            <span className="text-base leading-none">+</span> Add user
          </motion.button>
        </div>

        {/* Role stat row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {statCards.map((card) => {
            const t = card.color === "white" ? null : themeFor(card.key);
            const isActive = roleFilter === card.key;
            return (
              <motion.button
                key={card.key}
                onClick={() => setRoleFilter(card.key)}
                whileHover={{ y: -2 }}
                className={`text-left bg-[#11151c] border rounded-2xl p-4 transition-all duration-200 ${isActive ? (t ? t.ring : "border-white/25") : "border-white/5 hover:border-white/10"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-xs tracking-wide">{card.label}</p>
                  {t && <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`}></span>}
                </div>
                <p className="text-2xl text-white">{card.count}</p>
              </motion.button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 10A7 7 0 113 10a7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className={`${inputClass} cursor-pointer sm:w-48`}
          >
            <option value="all">All roles</option>
            <option value="receptionist">Receptionist</option>
            <option value="technician">Technician</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="bg-[#11151c] rounded-2xl overflow-hidden border border-white/5">

          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_40px] gap-4 px-5 py-3 bg-white/[0.02] border-b border-white/5 text-xs text-gray-500 tracking-wide">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Joined</span>
            <span></span>
          </div>

          {loading ? (
            [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          ) : sortedUsers.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-6">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-600 mb-4">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-gray-300 text-sm mb-1">No users found</p>
              <p className="text-gray-600 text-xs">
                {users.length === 0 ? "Create your first staff account." : "Try a different search or filter."}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {sortedUsers.map((user, idx) => {
                const t = themeFor(user.role);
                const isSelf = user._id === currentUserId;

                return (
                  <motion.div
                    key={user._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.15) }}
                    className={`relative md:grid md:grid-cols-[2fr_2fr_1fr_1fr_40px] md:gap-4 md:items-center flex flex-col gap-3 pl-5 pr-5 py-4 border-b border-white/5 last:border-0 transition-colors duration-150 group ${isSelf ? "bg-white/[0.02]" : "hover:bg-white/[0.02]"
                      }`}
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-[2px] ${t.accent} opacity-60`}></span>

                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} role={user.role} />
                      <div className="md:hidden">
                        <p className="text-sm text-gray-200 flex items-center gap-2">
                          {user.name}
                          {isSelf && (
                            <span className="text-[10px] text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">You</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <p className="hidden md:flex items-center gap-2 text-sm text-gray-200">
                        {user.name}
                        {isSelf && (
                          <span className="text-[10px] text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-md">You</span>
                        )}
                      </p>
                    </div>

                    <p className="hidden md:block text-sm text-gray-400 truncate">{user.email}</p>

                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-xs border capitalize ${t.badge}`}>
                        {user.role}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </p>

                    <div className="flex justify-end md:justify-center">
                      {isSelf ? (
                        <span
                          className="w-7 h-7 flex items-center justify-center text-gray-700 cursor-not-allowed"
                          title="You can't remove your own account"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </span>
                      ) : (
                        <button
                          onClick={() => requestDelete(user)}
                          className="w-7 cursor-pointer h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150 opacity-60 md:opacity-0 md:group-hover:opacity-100"
                          title="Remove user"
                        >
                          <img src="delete.png" width={20} alt="" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AddUserModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={fetchUsers}
      />

      <DeleteUserModal
        user={userToDelete}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </motion.div>
  );
};

export default ManageUsers;