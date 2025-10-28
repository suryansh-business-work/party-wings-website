import React, { useEffect, useState } from "react";

type FormData = {
  businessName: string;
  ownerName: string;
  mobile: string;
  mobileVerified: boolean;
  email: string;
  category: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string;
  pan?: string;
  description: string;
  priceMin?: string;
  priceMax?: string;
  availability: string;
  upi?: string;
  bank?: string;
};

const samplePincodeLookup: Record<string, { city: string; state: string }> = {
  "110001": { city: "New Delhi", state: "Delhi" },
  "400001": { city: "Mumbai", state: "Maharashtra" },
  "560001": { city: "Bengaluru", state: "Karnataka" },
  "600001": { city: "Chennai", state: "Tamil Nadu" },
  "700001": { city: "Kolkata", state: "West Bengal" },
};

const categories = [
  "Catering",
  "Decoration",
  "Photography",
  "Venue",
  "DJ/Music",
  "Makeup Artist",
  "Event Planner",
  "Lighting",
  "Florist",
  "Rental Services",
  "Others",
];

export default function VendorRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [data, setData] = useState<FormData>({
    businessName: "",
    ownerName: "",
    mobile: "+91",
    mobileVerified: false,
    email: "",
    category: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    pan: "",
    description: "",
    priceMin: "",
    priceMax: "",
    availability: "Pan India",
    upi: "",
    bank: "",
  });

  useEffect(() => {
    if (data.pincode && data.pincode.length === 6) {
      const found = samplePincodeLookup[data.pincode];
      if (found) {
        setData((d) => ({ ...d, city: found.city, state: found.state }));
      }
    }
  }, [data.pincode]);

  const update = (patch: Partial<FormData>) => setData((d) => ({ ...d, ...patch }));

  const sendOtp = () => {
    const mobileDigits = data.mobile.replace(/[^0-9]/g, "");
    if (!/^91[6-9][0-9]{9}$/.test(mobileDigits)) {
      alert("Enter a valid Indian mobile with +91 and 10 digits.");
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(code);
    alert(`Mock OTP sent: ${code} (replace with real SMS API)`);
  };

  const verifyOtp = () => {
    if (otpInput === otp) {
      update({ mobileVerified: true });
      setOtp(null);
      setOtpInput("");
      alert("Mobile verified");
    } else {
      alert("Incorrect OTP");
    }
  };

  const onFiles = (fList: FileList | null) => {
    if (!fList) return;
    const arr = Array.from(fList).slice(0, 5);
    const ok = arr.every((f) => f.size < 5 * 1024 * 1024);
    if (!ok) return alert("Files must each be < 5MB and up to 5 files.");
    setFiles(arr);
  };

  const validateStep = () => {
    if (step === 1) {
      if (!data.businessName || !data.ownerName) return "Please enter business and owner names.";
      if (!/^\+91[6-9][0-9]{9}$/.test(data.mobile)) return "Enter mobile in +91xxxxxxxxxx format.";
      if (!data.mobileVerified) return "Please verify mobile with OTP.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return "Enter a valid email.";
    }
    if (step === 2) {
      if (!data.address || !data.pincode) return "Please enter address and pincode.";
      if (!/^\d{6}$/.test(data.pincode)) return "Enter a valid 6-digit pincode.";
    }
    if (step === 3) {
      if (!data.description) return "Provide a short service description.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) return alert(err);
    setStep((s) => Math.min(4, s + 1));
  };

  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = async () => {
    const err = validateStep();
    if (err) return alert(err);
    setLoading(true);
    // Simulate server upload
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setShowConfirmation(true);
    // In real app, POST to server endpoint with form data and files
  };

  if (showConfirmation) {
    return (
      <div className="p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold text-rose-600 mb-2">Thank you!</h2>
        <p className="text-gray-700 mb-4">Your registration is under review. Our team will contact you shortly.</p>
        <button className="px-4 py-2 bg-rose-600 text-white rounded" onClick={() => setShowConfirmation(false)}>Register another</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div className="h-2 bg-rose-500 rounded" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Step {step} of 4</span>
              <span>{step === 1 ? "Vendor" : step === 2 ? "Business" : step === 3 ? "Service" : "Payment"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        {step === 1 && (
          <div className="space-y-4">
            <label className="block">
              <div className="text-sm font-medium text-gray-700">Business Name</div>
              <input value={data.businessName} onChange={(e) => update({ businessName: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-gray-700">Owner / Contact Person</div>
              <input value={data.ownerName} onChange={(e) => update({ ownerName: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-gray-700">Mobile Number</div>
              <div className="flex gap-2 mt-1">
                <input value={data.mobile} onChange={(e) => update({ mobile: e.target.value })} className="flex-1 border rounded px-3 py-2" placeholder="+91xxxxxxxxxx" />
                <button type="button" onClick={sendOtp} className="px-3 py-2 bg-rose-600 text-white rounded">Send OTP</button>
              </div>
              {otp && (
                <div className="mt-2 flex gap-2">
                  <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} placeholder="Enter OTP" className="flex-1 border rounded px-3 py-2" />
                  <button type="button" onClick={verifyOtp} className="px-3 py-2 bg-green-600 text-white rounded">Verify</button>
                </div>
              )}
            </label>

            <label className="block">
              <div className="text-sm font-medium text-gray-700">Email</div>
              <input type="email" value={data.email} onChange={(e) => update({ email: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
            </label>

            <label className="block">
              <div className="text-sm font-medium text-gray-700">Business Category</div>
              <select value={data.category} onChange={(e) => update({ category: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <label className="block">
              <div className="text-sm font-medium text-gray-700">Business Address</div>
              <textarea value={data.address} onChange={(e) => update({ address: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" rows={3} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm font-medium text-gray-700">Pincode</div>
                <input value={data.pincode} onChange={(e) => update({ pincode: e.target.value.replace(/[^0-9]/g, "") })} className="mt-1 w-full border rounded px-3 py-2" maxLength={6} />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-gray-700">City</div>
                <input value={data.city} onChange={(e) => update({ city: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <div className="text-sm font-medium text-gray-700">State</div>
                <input value={data.state} onChange={(e) => update({ state: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
              </label>

              <label className="block">
                <div className="text-sm font-medium text-gray-700">Pincode</div>
                <input value={data.pincode} readOnly className="mt-1 w-full border rounded px-3 py-2 bg-gray-50" />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-sm font-medium text-gray-700">GSTIN (optional)</div>
                <input value={data.gstin} onChange={(e) => update({ gstin: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label>
                <div className="text-sm font-medium text-gray-700">PAN (optional)</div>
                <input value={data.pan} onChange={(e) => update({ pan: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label>
              <div className="text-sm font-medium text-gray-700">Service Description</div>
              <textarea value={data.description} onChange={(e) => update({ description: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" rows={4} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label>
                <div className="text-sm font-medium text-gray-700">Price Min (₹)</div>
                <input value={data.priceMin} onChange={(e) => update({ priceMin: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
              <label>
                <div className="text-sm font-medium text-gray-700">Price Max (₹)</div>
                <input value={data.priceMax} onChange={(e) => update({ priceMax: e.target.value })} className="mt-1 w-full border rounded px-3 py-2" />
              </label>
            </div>

            <label>
              <div className="text-sm font-medium text-gray-700">Service Availability</div>
              <select value={data.availability} onChange={(e) => update({ availability: e.target.value })} className="mt-1 w-full border rounded px-3 py-2">
                <option>Pan India</option>
                <option>State-based</option>
                <option>City-based</option>
              </select>
            </label>

            <label>
              <div className="text-sm font-medium text-gray-700">Upload Logo / Portfolio (max 5 files)</div>
              <input type="file" multiple accept="image/*" onChange={(e) => onFiles(e.target.files)} className="mt-1" />
              <div className="text-xs text-gray-500 mt-1">{files.length} files selected</div>
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label>
              <div className="text-sm font-medium text-gray-700">UPI ID / Bank Details (optional)</div>
              <input value={data.upi} onChange={(e) => update({ upi: e.target.value })} placeholder="your@upi" className="mt-1 w-full border rounded px-3 py-2" />
            </label>

            <label className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1" />
              <div className="text-sm text-gray-700">I agree to the <a href="/policies/terms" className="text-rose-600 underline">vendor partnership terms</a></div>
            </label>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={prev} disabled={step === 1} className="px-4 py-2 border rounded disabled:opacity-40">Back</button>
          {step < 4 ? (
            <button type="button" onClick={next} className="ml-auto px-4 py-2 bg-rose-600 text-white rounded">Next</button>
          ) : (
            <button type="button" onClick={submit} className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-500 text-white rounded flex items-center gap-2">
              {loading ? <span>Submitting...</span> : <span>Register as Vendor</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
