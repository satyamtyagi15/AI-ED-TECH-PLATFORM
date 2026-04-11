// src/pages/Register.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { register, registerTenant, clearError } from '../redux/authSlice.jsx';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formType, setFormType] = useState('user'); // 'user' or 'tenant'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    tenantId: '',
    studentId: '',
    grade: '',
    tenantName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    emergencyContacts: [{ name: '', phone: '', role: '' }]
  });

  const [tenants, setTenants] = useState([]);
  const [students, setStudents] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  // Redirect if logged in
  useEffect(() => {
    if (user?.role) {
      const roleToPath = {
        director: '/director-dashboard',
        teacher: '/teacher-dashboard',
        student: '/student-dashboard',
        parent: '/parent-dashboard'
      };
      navigate(roleToPath[user.role] || '/');
    }
  }, [user, navigate]);

  // Fetch tenants (mock for now)
  useEffect(() => {
    setTenants([
      { _id: '1', name: 'Springfield Elementary' },
      { _id: '2', name: 'South Park Elementary' },
      { _id: '3', name: 'Bayside High School' }
    ]);
  }, []);

  // Fetch students (mock for now)
  useEffect(() => {
    if (formData.role === 'parent' && formData.tenantId) {
      setStudents([
        { _id: '1', firstName: 'Bart', lastName: 'Simpson', grade: '4th' },
        { _id: '2', firstName: 'Lisa', lastName: 'Simpson', grade: '2nd' },
        { _id: '3', firstName: 'Milhouse', lastName: 'Van Houten', grade: '4th' }
      ]);
    }
  }, [formData.role, formData.tenantId]);

  // Handlers
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEmergencyContactChange = (index, field, value) => {
    const updatedContacts = [...formData.emergencyContacts];
    updatedContacts[index][field] = value;
    setFormData({ ...formData, emergencyContacts: updatedContacts });
  };

  const addEmergencyContact = () =>
    setFormData({
      ...formData,
      emergencyContacts: [...formData.emergencyContacts, { name: '', phone: '', role: '' }]
    });

  const removeEmergencyContact = (index) =>
    setFormData({
      ...formData,
      emergencyContacts: formData.emergencyContacts.filter((_, i) => i !== index)
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formType === 'tenant') {
      const tenantData = {
        name: formData.tenantName,
        address: formData.address,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        emergencyContacts: formData.emergencyContacts,
        userData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }
      };
      dispatch(registerTenant(tenantData));
    } else {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        tenantId: formData.tenantId,
        studentId: formData.role === 'parent' ? formData.studentId : null,
        grade: formData.role === 'student' ? formData.grade : null
      };
      dispatch(register(userData));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register for EduSafe</h2>

        {/* Switcher */}
        <div className="mb-6 flex">
          <button
            type="button"
            onClick={() => setFormType('user')}
            className={`w-1/2 py-2 ${
              formType === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Join Existing School
          </button>
          <button
            type="button"
            onClick={() => setFormType('tenant')}
            className={`w-1/2 py-2 ${
              formType === 'tenant' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Register New School
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Common user fields */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          {formType === 'user' ? (
            <>
              {/* Role Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="director">Director</option>
                </select>
              </div>

              {/* Tenant selection */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Select School/Institute</label>
                <select
                  name="tenantId"
                  value={formData.tenantId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                >
                  <option value="">-- Select School --</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Extra fields by role */}
              {formData.role === 'student' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Grade/Class</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
              )}

              {formData.role === 'parent' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Select Student</label>
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">-- Select Student --</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} ({s.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Tenant registration fields */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">School/Institute Name</label>
                <input
                  type="text"
                  name="tenantName"
                  value={formData.tenantName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              {/* Emergency Contacts */}
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Emergency Contacts</label>
                {formData.emergencyContacts.map((contact, index) => (
                  <div key={index} className="mb-2 p-2 border rounded">
                    <input
                      type="text"
                      placeholder="Name"
                      value={contact.name}
                      onChange={(e) =>
                        handleEmergencyContactChange(index, 'name', e.target.value)
                      }
                      className="w-full px-2 py-1 mb-1 border rounded"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={contact.phone}
                      onChange={(e) =>
                        handleEmergencyContactChange(index, 'phone', e.target.value)
                      }
                      className="w-full px-2 py-1 mb-1 border rounded"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={contact.role}
                      onChange={(e) =>
                        handleEmergencyContactChange(index, 'role', e.target.value)
                      }
                      className="w-full px-2 py-1 mb-1 border rounded"
                      required
                    />
                    {formData.emergencyContacts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmergencyContact(index)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEmergencyContact}
                  className="text-blue-500 text-sm"
                >
                  + Add Emergency Contact
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
