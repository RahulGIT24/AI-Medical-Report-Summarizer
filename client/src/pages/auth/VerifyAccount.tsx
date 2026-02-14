import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiCall } from "../../lib/apiCall";

type Status = "loading" | "success" | "error";

export default function VerifyAccount() {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your account...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing token.");
      redirectAfterDelay();
      return;
    }

    const verify = async () => {
      try {
        await apiCall(`/auth/verify-account?token=${token}`);
        setStatus("success");
        setMessage("Your account has been successfully verified 🎉");
      } catch (err) {
        setStatus("error");
        setMessage("Token is invalid or expired.");
      } finally {
        redirectAfterDelay();
      }
    };

    verify();
  }, [searchParams]);

  const redirectAfterDelay = () => {
    setTimeout(() => {
      navigate("/signin");
    }, 5000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Account Verification</h1>

        {status === "loading" && (
          <p className="text-gray-300 animate-pulse">{message}</p>
        )}

        {status === "success" && (
          <p className="text-green-400 font-medium">{message}</p>
        )}

        {status === "error" && (
          <p className="text-red-400 font-medium">{message}</p>
        )}

        <p className="text-gray-400 text-sm mt-4">
          You will be redirected to sign in in 5 seconds...
        </p>
      </div>
    </div>
  );
}
