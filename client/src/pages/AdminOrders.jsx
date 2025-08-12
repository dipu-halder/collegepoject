import { useEffect, useState } from "react";
import { useAuth } from "../store/auth";
import { toast } from "react-toastify";
import "./style/AdminOrders.css";

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const { authorizationToken } = useAuth();

  const getAllOrders = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders`,
        {  method: "GET",
           headers: { Authorization: authorizationToken } }
      );
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: authorizationToken,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) {
        toast.success("Status updated");
        getAllOrders();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Delivered": return "status-delivered";
      case "Confirmed": return "status-confirmed";
      case "Preparing": return "status-preparing";
      case "Out for Delivery": return "status-out";
      case "Pending": 
      default: return "status-pending";
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const search = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(search) ||
      order.user?.name?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search)
    );
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <section className="admin_orders-section">
      <h1>All Orders</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search by ID, User, or Status..."
        className="order-search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-wrapper">
        <table className="admin-orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order._id} className="order-row">
                  <td>{order._id}</td>
                  <td>{order.user?.name || "N/A"} ({order.user?.email || "N/A"})</td>
                  <td>
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items
                          .map(
                            (item) =>
                              `${item?.title || "Unknown"} x${item?.quantity || 0}`
                          )
                          .join(", ")
                      : "No items"}
                  </td>
                  <td>${order.total ?? 0}</td>
                  <td className={`status-cell ${getStatusClass(order.status)}`}>
                    {order.status || "Pending"}
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status || "Pending"}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};
