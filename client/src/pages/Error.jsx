import React from 'react'
import { useNavigate } from "react-router-dom";
import { alertCircleOutline, homeOutline } from "ionicons/icons";
import { IonIcon } from "@ionic/react";
const Error = () => {
    const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
      <IonIcon icon={alertCircleOutline} className="text-red-500 text-6xl mb-4" />
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">Oops! The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        <IonIcon icon={homeOutline} className="text-xl" />
        Go Home
      </button>
    </div>
  )
}

export default Error
