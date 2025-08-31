// Admin-Rider.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../store/auth";
import { ToastContainer, toast } from "react-toastify";

export default function AdminRider() {
  const { authorizationToken } = useAuth();
  const API = import.meta.env.VITE_API_URL;

  const [pending, setPending] = useState([]);
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  // map of id => boolean for per-row loading
  const [rowLoading, setRowLoading] = useState({});

  const safeJSON = async (res) => {
    const text = await res.text();
    try { return JSON.parse(text); }
    catch { throw new Error(`HTTP ${res.status}: ${text}`); }
  };

  const getAuthHeader = () => {
    if (!authorizationToken) return {};
    return {
      Authorization: authorizationToken.startsWith("Bearer")
        ? authorizationToken
        : `Bearer ${authorizationToken}`
    };
  };

  const fetchPendingRiders = useCallback(async () => {
    const res = await fetch(`${API}/api/admin/Riders/pending`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await safeJSON(res);
    setPending(Array.isArray(data) ? data : []);
  }, [API, authorizationToken]);

  const fetchAllRiders = useCallback(async () => {
    const res = await fetch(`${API}/api/admin/Riders/all`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await safeJSON(res);
    setAll(Array.isArray(data) ? data : []);
  }, [API, authorizationToken]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPendingRiders(), fetchAllRiders()]);
    } catch (e) {
      console.error("Failed to load riders:", e);
      toast.error("Failed to load riders");
    } finally {
      setLoading(false);
    }
  }, [fetchPendingRiders, fetchAllRiders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const setRowBusy = (id, busy) => setRowLoading(prev => ({ ...prev, [id]: busy }));

  const approve = async (id) => {
    if (!authorizationToken) {
      toast.error("No auth token — login as admin");
      return;
    }
    if (!window.confirm("Approve this rider?")) return;

    setRowBusy(id, true);
    try {
      const res = await fetch(`${API}/api/admin/Riders/approve/${id}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Approve failed:", text);
        toast.error(`Approve failed: ${text}`);
        return;
      }

      // Try to read returned rider object (if backend returns it)
      let updated;
      try { updated = await safeJSON(res); } catch (_) { updated = null; }

      toast.success("Rider approved");

      // Optimistically update UI:
      setPending(prev => prev.filter(r => r._id !== id));
      setAll(prev => {
        // if updated returned, replace; else set isApproved true for matching
        if (updated && updated._id) {
          // ensure it exists in list, else push
          const exists = prev.find(p => p._id === updated._id);
          if (exists) return prev.map(p => p._id === updated._id ? updated : p);
          return [updated, ...prev];
        }
        return prev.map(r => r._id === id ? { ...r, isApproved: true } : r);
      });

    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Approve failed");
    } finally {
      setRowBusy(id, false);
    }
  };

  const reject = async (id) => {
    if (!authorizationToken) {
      toast.error("No auth token — login as admin");
      return;
    }
    if (!window.confirm("Reject (delete) this rider? This action cannot be undone.")) return;

    setRowBusy(id, true);
    try {
      const res = await fetch(`${API}/api/admin/Riders/reject/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Reject failed:", text);
        toast.error(`Reject failed: ${text}`);
        return;
      }

      toast.success("Rider rejected and removed");
      // remove from both lists
      setPending(prev => prev.filter(r => r._id !== id));
      setAll(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error("Reject error:", err);
      toast.error("Reject failed");
    } finally {
      setRowBusy(id, false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading riders…</div>;

  return (
    <>
      <section className="admin_riders-section" style={{ padding: 12 }}>
        <h1>Riders</h1>

        <h2>Pending</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 6 }}>Name</th>
              <th style={{ padding: 6 }}>Phone</th>
              <th style={{ padding: 6 }}>Vehicle</th>
              <th style={{ padding: 6 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pending.length ? pending.map(r => (
              <tr key={r._id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                <td style={{ padding: 6 }}>{r.name}</td>
                <td style={{ padding: 6 }}>{r.phone}</td>
                <td style={{ padding: 6 }}>{r.vehicle?.type} {r.vehicle?.regNo}</td>
                <td style={{ padding: 6 }}>
                  <button
                    onClick={() => approve(r._id)}
                    disabled={!!rowLoading[r._id]}>
                    {rowLoading[r._id] ? "Approving…" : "Approve"}
                  </button>
                  <button
                    onClick={() => reject(r._id)}
                    disabled={!!rowLoading[r._id]}
                    style={{ marginLeft: 8 }}>
                    {rowLoading[r._id] ? "Working…" : "Reject"}
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ padding: 8 }}>No pending riders</td></tr>
            )}
          </tbody>
        </table>

        <h2 style={{ marginTop: 24 }}>All</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 6 }}>Name</th>
              <th style={{ padding: 6 }}>Phone</th>
              <th style={{ padding: 6 }}>Vehicle</th>
              <th style={{ padding: 6 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {all.length ? all.map(r => (
              <tr key={r._id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                <td style={{ padding: 6 }}>{r.name}</td>
                <td style={{ padding: 6 }}>{r.phone}</td>
                <td style={{ padding: 6 }}>{r.vehicle?.type} {r.vehicle?.regNo}</td>
                <td style={{ padding: 6 }}>
                  <strong style={{
                    color: r.isApproved ? "green" : "#444",
                    background: r.isApproved ? "#e6ffed" : "#fff",
                    padding: "4px 8px",
                    borderRadius: 6
                  }}>
                    {r.isApproved ? "Approved" : "Pending"}
                  </strong>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ padding: 8 }}>No riders</td></tr>
            )}
          </tbody>
        </table>
      </section>
      <ToastContainer />
    </>
  );
}
