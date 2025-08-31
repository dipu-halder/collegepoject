// src/components/AdminOrders.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";
import io from "socket.io-client";
import "./style/AdminOrders.css";

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [riders, setRiders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedRiders, setSelectedRiders] = useState({}); // per-order selected rider ids array
  const [selectAllForOrder, setSelectAllForOrder] = useState({}); // per-order boolean for "select all riders"
  const ordersPerPage = 10;
  const { authorizationToken } = useAuth();
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  // normalize header with Bearer prefix
  const authHeader = useMemo(() => {
    if (!authorizationToken) return "";
    return authorizationToken.startsWith("Bearer ")
      ? authorizationToken
      : `Bearer ${authorizationToken}`;
  }, [authorizationToken]);

  const buildHeaders = (extra = {}) => ({
    Authorization: authHeader,
    "Content-Type": "application/json",
    ...extra,
  });

  // ---------- API Calls ----------
  const getAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/orders`, {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || `Failed to fetch orders (${res.status})`);
      }
      const data = await res.json();
      if (!mountedRef.current) return;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("getAllOrders error:", err);
      toast.error(err.message || "Could not fetch orders");
      setOrders([]);
    } finally {
      if (mountedRef.current) setLoadingOrders(false);
    }
  };

  const getRiders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/Riders/all`, {
        headers: { Authorization: authHeader },
      });
      if (!res.ok) {
        const e = await res.json().catch(() => null);
        throw new Error(e?.message || "Failed to fetch riders");
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      const approved = list.filter((r) => r.isApproved === true || r.isApproved === "true");
      if (mountedRef.current) setRiders(approved);
    } catch (err) {
      console.error("getRiders error:", err);
      toast.error("Could not fetch riders");
      if (mountedRef.current) setRiders([]);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: buildHeaders(),
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to update status");
      }
      toast.success("Status updated");
      await getAllOrders();
    } catch (error) {
      console.error("updateOrderStatus error:", error);
      toast.error(error.message || "Something went wrong while updating status");
    }
  };

  const assignRider = async (orderId, riderId) => {
    try {
      const body = riderId ? { riderId } : { riderId: null };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/assign-rider`,
        {
          method: "PATCH",
          headers: buildHeaders(),
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to assign rider");
      }
      toast.success(riderId ? "Rider assigned" : "Rider unassigned");
      await getAllOrders();
    } catch (error) {
      console.error("assignRider error:", error);
      toast.error(error.message || "Something went wrong while assigning rider");
    }
  };

  const offerRiders = async (orderId, riderIds) => {
    try {
      if (!Array.isArray(riderIds) || riderIds.length === 0) {
        toast.info("No riders selected to offer");
        return;
      }
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${orderId}/offer-riders`,
        {
          method: "POST",
          headers: buildHeaders(),
          body: JSON.stringify({ riderIds }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Failed to offer to riders");
      }
      toast.success("Offered to riders");
      await getAllOrders();
    } catch (err) {
      console.error("offerRiders error:", err);
      toast.error(err.message || "Something went wrong offering to riders");
    }
  };

  // Offer to all approved riders (quick action)
  const offerToAllApproved = async (orderId) => {
    if (!riders || riders.length === 0) {
      toast.info("No approved riders available");
      return;
    }
    const ids = riders.map((r) => r._id);
    await offerRiders(orderId, ids);
  };

  // ---------- Socket setup ----------
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!authHeader) return;

    // connect socket with auth token (server expects Bearer or token string - we pass what's used elsewhere)
    const socket = io(import.meta.env.VITE_API_URL, {
      auth: { token: authHeader },
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Admin socket connected", socket.id);
    });

    // These events refresh the list (could be optimized to patch single order in-place)
    const refreshOn = () => {
      getAllOrders().catch((e) => console.error(e));
    };

    socket.on("order.assigned", refreshOn);
    socket.on("order.unassigned", refreshOn);
    socket.on("order.offer.rejected", refreshOn);
    socket.on("order.status.updated", refreshOn);
    socket.on("order.created", refreshOn); // if server emits on new order

    socket.on("connect_error", (err) => {
      console.warn("Admin socket connect_error:", err.message || err);
    });

    socket.on("disconnect", (reason) => {
      console.log("Admin socket disconnected:", reason);
    });

    return () => {
      if (socket) {
        socket.off("order.assigned", refreshOn);
        socket.off("order.unassigned", refreshOn);
        socket.off("order.offer.rejected", refreshOn);
        socket.off("order.status.updated", refreshOn);
        socket.off("order.created", refreshOn);
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHeader]);

  // ---------- Init load ----------
  useEffect(() => {
    getAllOrders();
    getRiders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Debounced search ----------
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ---------- Filtering / Pagination ----------
  const filteredOrders = useMemo(() => {
    const search = debouncedSearch || "";
    if (!search) return orders;
    return orders.filter((order) => {
      return (
        (order._id || "").toString().toLowerCase().includes(search) ||
        (order.user?.name || "").toString().toLowerCase().includes(search) ||
        (order.customerName || "").toString().toLowerCase().includes(search) ||
        (order.status || "").toString().toLowerCase().includes(search)
      );
    });
  }, [orders, debouncedSearch]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage));

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "status-delivered";
      case "Confirmed":
        return "status-confirmed";
      case "Preparing":
        return "status-preparing";
      case "Out for Delivery":
        return "status-out";
      default:
        return "status-pending";
    }
  };

  // ---------- Multi-select helpers (per order) ----------
  const handleMultiSelectChange = (orderId, selectedOptions) => {
    const values = Array.from(selectedOptions).map((opt) => opt.value);
    setSelectedRiders((prev) => ({ ...prev, [orderId]: values }));
    // update selectAll toggle based on selection
    const allSelected = riders.length > 0 && values.length === riders.length;
    setSelectAllForOrder((prev) => ({ ...prev, [orderId]: allSelected }));
  };

  const toggleSelectAllForOrder = (orderId) => {
    const currentlyAll = selectAllForOrder[orderId] === true;
    if (currentlyAll) {
      // unselect all
      setSelectedRiders((prev) => ({ ...prev, [orderId]: [] }));
      setSelectAllForOrder((prev) => ({ ...prev, [orderId]: false }));
    } else {
      // select all rider IDs
      const ids = riders.map((r) => r._id);
      setSelectedRiders((prev) => ({ ...prev, [orderId]: ids }));
      setSelectAllForOrder((prev) => ({ ...prev, [orderId]: true }));
    }
  };

  // Small helper: get assignedRider id string (works if it's object or id)
  const assignedRiderValue = (order) =>
    order?.assignedRider?._id ? order.assignedRider._id : order?.assignedRider || "";

  // ---------- Render ----------
  return (
    <section className="admin_orders-section">
      <h1>All Orders</h1>

      {/* search + refresh */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search by ID, User, or Status..."
          className="order-search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{ flex: 1 }}
        />
        <button
          onClick={() => {
            getAllOrders();
            getRiders();
          }}
          style={{ padding: "6px 10px" }}
        >
          Refresh
        </button>
      </div>

      {/* table */}
      <div className="table-wrapper">
        <table className="admin-orders-table" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Change Status</th>
              <th>Rider</th>
            </tr>
          </thead>
          <tbody>
            {loadingOrders ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Loading orders...
                </td>
              </tr>
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order._id} className="order-row">
                  {/* Order ID + user */}
                  <td style={{ verticalAlign: "top" }}>
                    {order._id}
                    <div style={{ marginTop: 8 }}>
                      <h4 style={{ margin: "6px 0" }}>User Details</h4>
                      <div>{order.user?.email || order.customerEmail || "N/A"}</div>
                    </div>
                  </td>

                  {/* Customer info */}
                  <td style={{ verticalAlign: "top" }}>
                    <div>
                      <strong>{order.user?.name || order.customerName || "N/A"}</strong>
                    </div>
                    <div>{order.customerEmail || order.user?.email || "N/A"}</div>
                    <div>{order.user?.mobile || order.customerPhone || "N/A"}</div>
                    <div style={{ maxWidth: 220, wordBreak: "break-word" }}>
                      {order.user?.address || order.customerAddress || "N/A"}
                    </div>
                  </td>

                  {/* Items */}
                  <td style={{ verticalAlign: "top" }}>
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            {item?.img && (
                              <img
                                src={item.img}
                                alt={item.name || "Item"}
                                style={{
                                  width: 40,
                                  height: 40,
                                  objectFit: "cover",
                                  borderRadius: 4,
                                }}
                              />
                            )}
                            <span>
                              {item?.name || "Unknown"} × {item?.quantity ?? 0}
                            </span>
                          </div>
                        ))
                      : "No items"}
                  </td>

                  {/* Total */}
                  <td style={{ verticalAlign: "top" }}>₹{order.total ?? 0}</td>

                  {/* Status */}
                  <td
                    style={{ verticalAlign: "top" }}
                    className={`status-cell ${getStatusClass(order.status)}`}
                  >
                    {order.status || "Pending"}
                  </td>

                  {/* Change Status */}
                  <td style={{ verticalAlign: "top" }}>
                    <select
                      className="status-select"
                      value={order.status || "Pending"}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>

                  {/* Rider Actions */}
                  <td style={{ verticalAlign: "top" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Direct assign + offer to all */}
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <select
                          className="rider-select"
                          value={assignedRiderValue(order)}
                          onChange={(e) => assignRider(order._id, e.target.value)}
                        >
                          <option value="">-- Assign Rider --</option>
                          {riders.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name} {r.phone ? `(${r.phone})` : ""}
                            </option>
                          ))}
                        </select>

                        <button onClick={() => offerToAllApproved(order._id)} title="Offer to all approved riders">
                          Offer to Riders
                        </button>
                      </div>

                      {/* 🆕 Multi-select offer with Select All */}
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 13, color: "#333" }}>Offer to selected riders</div>
                          <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                            <input
                              type="checkbox"
                              checked={!!selectAllForOrder[order._id]}
                              onChange={() => toggleSelectAllForOrder(order._id)}
                            />
                            Select all
                          </label>
                        </div>

                        <select
                          multiple
                          value={selectedRiders[order._id] || []}
                          onChange={(e) =>
                            handleMultiSelectChange(order._id, e.target.selectedOptions)
                          }
                          style={{ width: "100%", minHeight: 80, marginTop: 6 }}
                        >
                          {riders.map((r) => (
                            <option key={r._id} value={r._id}>
                              {r.name} {r.phone ? `(${r.phone})` : ""}
                            </option>
                          ))}
                        </select>
                        <button
                          style={{ marginTop: 6 }}
                          onClick={() => offerRiders(order._id, selectedRiders[order._id] || [])}
                        >
                          Offer Selected
                        </button>
                      </div>

                      {/* Info */}
                      <div style={{ fontSize: 13 }}>
                        {order.assignedRider ? (
                          <div>
                            <strong>Assigned:</strong> {order.assignedRider.name || order.assignedRider}{" "}
                            {order.assignedRider?.phone ? `(${order.assignedRider.phone})` : ""}
                          </div>
                        ) : (
                          <div style={{ color: "#666" }}>
                            {order.pendingOffers && order.pendingOffers.length > 0
                              ? `Offered to ${order.pendingOffers.length} rider(s)`
                              : "No rider assigned"}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination" style={{ marginTop: 12 }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <span style={{ margin: "0 8px" }}>
            {currentPage} / {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default AdminOrders;
