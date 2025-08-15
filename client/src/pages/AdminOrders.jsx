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
        {
          method: "GET",
          headers: { Authorization: authorizationToken },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch orders");
        setOrders([]);
        return;
      }

      const data = await res.json();
    console.log(data)
      let fetchedOrders = [];
      if (Array.isArray(data)) {
        fetchedOrders = data;
      } else if (data && Array.isArray(data.orders)) {
        fetchedOrders = data.orders;
      } else if (data && data.data && Array.isArray(data.data)) {
        fetchedOrders = data.data;
      }

      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
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
      console.error("Error updating status:", error);
    }
  };

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

  useEffect(() => {
    getAllOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order._id?.toLowerCase().includes(search) ||
      order.user?.name?.toLowerCase().includes(search) ||
      order.customerName?.toLowerCase().includes(search) ||
      order.status?.toLowerCase().includes(search)
    );
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <section className="admin_orders-section">
      <h1>All Orders</h1>

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
              <th>Customer</th>
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
                  <td>{order._id}
                     <div> 
                      <h3>user details</h3>
                      
                      {order.user?.email || order.customerEmail || "N/A"}
                    </div>
                  </td>
                  <td>
                    {/* Show registered user OR guest checkout form info */}
                    <div>
                      <strong>
                        {order.user?.name || order.customerName || "N/A"}
                      </strong>
                    </div>
                   
                      
                    <div>
                      {order. order?.customerEmail|| order.customerEmail|| "N/A"}
                    </div>
                    <div>
                      {order.user?.mobile || order.customerPhone || "N/A"}
                    </div>
                    <div>
                      {order.user?.address || order.customerAddress || "N/A"}
                    </div>
                  </td>
                  <td>
                    {Array.isArray(order.items) && order.items.length > 0
                      ? order.items.map((item, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              marginBottom: "4px",
                            }}
                          >
                            {item?.img && (
                              <img
                                src={item.img}
                                alt={item.name || "Item"}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                            <span>
                              {item?.name || "Unknown"} ×
                              {item?.quantity || 0}
                            </span>
                          </div>
                        ))
                      : "No items"}
                  </td>
                  <td>₹{order.total ?? 0}</td>
                  <td
                    className={`status-cell ${getStatusClass(order.status)}`}
                  >
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
                      <option value="Out for Delivery">
                        Out for Delivery
                      </option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Prev
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
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
