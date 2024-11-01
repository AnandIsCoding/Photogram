import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
function Signup() {
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    userName: "",
    userImage: null, // Add userImage to the state
  });

  // Handle input change
  const handleChange = (event) => {
    const { name, value } = event.target;
    setSignupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle file input change
  const handleFileChange = (event) => {
    setSignupData((prevData) => ({
      ...prevData,
      userImage: event.target.files[0], // Store the selected file
    }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    console.log("Request payload:", signupData);
    
    // Create a FormData object to handle file upload
    const formData = new FormData();
    formData.append("userName", signupData.userName);
    formData.append("email", signupData.email);
    formData.append("password", signupData.password);
    if (signupData.userImage) {
      formData.append("userImage", signupData.userImage); // Append the image file
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/signup",
        signupData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set the correct content type
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        toast.success('User created successfully');
        alert(res.data.message);
      }
    } catch (error) {
      console.log(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={submitHandler}
        className="flex flex-col w-[90%] md:w-[30%] px-5 py-14 gap-10 border-2 text-lg text-green-500 border-green-400 rounded-xl mt-[57vw] md:mt-[6vw]"
      >
        <input
          type="file"
          id="userImage"
          name="userImage"
          accept="image/*"
          onChange={handleFileChange} // Call handleFileChange when file input changes
          className="px-5 py-3 outline-none bg-transparent border-2 border-green-400 rounded-xl"
        />

        <input
          required
          id="userName"
          name="userName"
          value={signupData.userName}
          onChange={handleChange}
          type="text"
          placeholder="Enter your name 👲"
          className="px-5 py-3 outline-none bg-transparent border-2 border-green-400 rounded-xl"
        />

        <input
          required
          id="email"
          name="email"
          value={signupData.email}
          onChange={handleChange}
          type="email"
          placeholder="Enter your email 📩"
          className="px-5 py-3 outline-none bg-transparent border-2 border-green-400 rounded-xl"
        />

        <input
          required
          id="password"
          name="password"
          value={signupData.password}
          onChange={handleChange}
          type="password"
          placeholder="Enter your password 🔑"
          className="px-5 py-3 outline-none bg-transparent border-2 border-green-400 rounded-xl"
        />

        <input
          type="submit"
          value="Submit"
          className="px-5 py-2 outline-none bg-green-400 text-2xl text-black font-extrabold rounded-xl cursor-pointer"
        />
      </form>
    </div>
  );
}

export default Signup;
