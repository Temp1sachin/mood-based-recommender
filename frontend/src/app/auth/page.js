'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    profilePic: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePic') {
      setForm({ ...form, profilePic: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();

    try {
      let res;

      if (isSignup) {
        const formData = new FormData();
        formData.append('fullName', form.fullName);
        formData.append('email', form.email);
        formData.append('password', form.password);
        formData.append('profilePic', form.profilePic);

        res = await fetch('http://localhost:8000/api/auth/signup', {
          method: 'POST',
          body: formData,
        });
        
      } else {
        res = await fetch('http://localhost:8000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Something went wrong!');
        return;
      }

      
      localStorage.setItem('token', data.token);
      if(isSignup) router.push(`/verify?email=${encodeURIComponent(form.email)}`);
      else router.push(`/dashboard`);
      alert(`${isSignup ? 'Signed up' : 'Logged in'} successfully!`);
      

    } catch (err) {
      console.error(err);
      alert('Network error!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h2 className="text-3xl font-bold mb-6">{isSignup ? 'Sign Up' : 'Login'}</h2>

      <form className="flex flex-col gap-4 w-full max-w-sm" onSubmit={handleSubmit}>
        {isSignup && (
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="p-2 border rounded"
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="p-2 border rounded"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="p-2 border rounded"
          onChange={handleChange}
          required
        />
        {isSignup && (
          <input
            type="file"
            name="profilePic"
            className="p-2 border rounded"
            onChange={handleChange}
            accept="image/*"
            required
          />
        )}
       
        <button type="submit" className="bg-green-500 text-white py-2 rounded hover:bg-green-600">
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>

      <button
        onClick={() => setIsSignup(!isSignup)}
        className="mt-4 text-blue-500 underline"
      >
         {!isSignup && (
  <button
    onClick={() => router.push(`/forgot?email=${encodeURIComponent(form.email)}`)}
    className="mt-2 text-sm text-blue-500 underline"
  >
    Forgot Password?
  </button>
)}
<br></br>
        {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
      </button>
    </div>
  );
}
