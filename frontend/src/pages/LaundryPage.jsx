import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Shirt as Tshirt,
  Loader2,
  PackageCheck,
  CheckCircle2,
  ArrowUpDown,
  CheckCircle,
} from "lucide-react";
import { LaundryDataContext } from "../context/LaundryContext";
import { LaundryNavbar } from "../navbars/LaundryNavbar";
function LaundryPage() {
  const token = localStorage.getItem("token");
  const { laundry, setLaundry } = useContext(LaundryDataContext);
  const orderList = laundry.orders;
  const [orders, setOrders] = useState(orderList);
  const [selectedStatus, setSelectedStatus] = useState("To be picked up");
  const [sortOrder, setSortOrder] = useState("newest");
  // console.log(orders);

  const moveToWash = async (orderId, studentId, currStatus) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/laundry/pickupnow`,
        { orderId, studentId, currStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLaundry(response.data.laundry);
      toast.success(response.data.message);
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  };
  const statusColors = {
    "To be picked up": "bg-blue-100 text-blue-800",
    Washing: "bg-yellow-100 text-yellow-800",
    "To be Delivered": "bg-orange-300 text-white",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  const statusButtons = [
    { status: "To be picked up", label: "To be picked up", icon: PackageCheck },
    { status: "Washing", label: "Washing", icon: Loader2 },
    { status: "To be Delivered", label: "To be Delivered", icon: Tshirt },
    { status: "Completed", label: "Completed", icon: CheckCircle2 },
  ];

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "newest" ? "oldest" : "newest"));
  };

  const getSortedOrders = (filteredOrders) => {
    return [...filteredOrders].sort((a, b) => {
      const sortMultiplier = sortOrder === "newest" ? -1 : 1;
      return sortMultiplier * (new Date(a.createdAt) - new Date(b.createdAt));
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#eeaeca] to-[#94bbe9]">
      <LaundryNavbar />

      <main className="  max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-[#3c3c78] my-6 ">
          {laundry.name}
        </h1>
        <div className="  rounded-lg shadow-lg p-2 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4  border-b">
            {statusButtons.map(({ status, label, icon: Icon }) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${
                    selectedStatus === status
                      ? statusColors[status]
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          <div className="px-6 py-3 bg-gray-50 border-b flex justify-end">
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort by:{" "}
              {sortOrder === "newest" ? "Newest First" : "Oldest First"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Laundry ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getSortedOrders(
                  orders.filter((order) => order.orderStatus === selectedStatus)
                ).map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.from.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.from.laundryId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.from.hostel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.from.roomNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        if (order.orderStatus === "To be picked up") {
                          return (
                            <button
                              onClick={() =>
                                moveToWash(
                                  order._id,
                                  order.from._id,
                                  selectedStatus
                                )
                              }
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md"
                            >
                              Pick Up Now
                            </button>
                          );
                        } else if (order.orderStatus === "Washing") {
                          return (
                            <button
                              onClick={() =>
                                moveToWash(
                                  order._id,
                                  order.from._id,
                                  selectedStatus
                                )
                              }
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md"
                            >
                              Ready to deliver
                            </button>
                          );
                        } else if (order.orderStatus === "To be Delivered") {
                          return (
                            <button
                              onClick={() =>
                                moveToWash(
                                  order._id,
                                  order.from._id,
                                  selectedStatus
                                )
                              }
                              className="px-3 py-1 bg-orange-300 text-white rounded-md flex gap-2"
                            >
                              Delivered
                              <CheckCircle2 />
                            </button>
                          );
                        } else {
                          return <CheckCircle className="text-green-500" />;
                        }
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LaundryPage;
