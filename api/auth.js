// api/auth.js

// Sign-In function
export const signIn = async (email, password, role) => {
  try {
    const response = await fetch('http://10.0.2.2:5000/api/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Sign-in failed:', errorData);
      throw new Error(errorData.message || 'Sign-in failed');
    }

    const data = await response.json();
    console.log('Sign-in response data:', data);
    return data;
  } catch (error) {
    console.error('Error in sign-in request:', error);
    throw error;
  }
};

// Sign-Up function
export const signUp = async (name, email, password, role) => {
  try {
    console.log('Sending sign-up request to backend');
    const response = await fetch('http://10.0.2.2:5000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Sign-up failed:', errorData);
      throw new Error(errorData.message || 'Sign-up failed');
    }

    const data = await response.json();
    console.log('Sign-up response data:', data);
    return data;
  } catch (error) {
    console.error('Error in sign-up request:', error);
    throw error;
  }
};
