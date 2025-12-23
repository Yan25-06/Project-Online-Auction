import React, { useState, useEffect } from "react";
import { AdminService } from "../../services/adminService";

export default function AdminUpgradeRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await AdminService.users.getPendingUpgrades();
      setRequests(data || []);
    } catch (error) {
      console.error("Error loading upgrade requests:", error);
      alert("Failed to load upgrade requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm("Approve this seller upgrade request?")) return;

    try {
      await AdminService.users.approveUpgrade(userId);
      alert("Upgrade request approved");
      loadRequests();
    } catch (error) {
      console.error("Error approving upgrade:", error);
      alert("Failed to approve upgrade request");
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("Reject this seller upgrade request?")) return;

    try {
      await AdminService.users.rejectUpgrade(userId);
      alert("Upgrade request rejected");
      loadRequests();
    } catch (error) {
      console.error("Error rejecting upgrade:", error);
      alert("Failed to reject upgrade request");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Seller Upgrade Requests
          </h1>

          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white shadow sm:rounded-lg p-6 text-center text-gray-500">
              No pending upgrade requests
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.upgrade_requested_at
                            ? formatDate(user.upgrade_requested_at)
                            : "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.total_ratings > 0
                          ? `${user.positive_ratings}/${
                              user.total_ratings
                            } (${Math.round(
                              (user.positive_ratings / user.total_ratings) * 100
                            )}%)`
                          : "No ratings"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleApprove(user.id)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
