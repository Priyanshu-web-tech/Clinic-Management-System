export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const Alert = ({message}) => {
  return (
    <div className="fixed bottom-8 left-0 w-full flex justify-center">
      <div className="bg-white border border-gray-300 p-4 rounded-md shadow-md">
        <p>{message}</p>
      </div>
    </div>
  );
};

// export const baseURL = import.meta.env.VITE_BASE_URL;

// For Hosting:
export const baseURL = window.location.origin;