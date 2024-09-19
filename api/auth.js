export async function signIn(email, password, role) {
    try {
      const response = await fetch('http://localhost:5000/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return { message: 'Sign-in failed' };
    }
  }
  
  // api/auth.js
export const signUp = async (name, email, password, role) => {
  try {
    console.log('Sending sign-up request to backend');
    const response = await fetch('http://10.0.2.2:5000/api/signup', { // Replace with your backend URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Sign-up failed:', errorData);
      throw new Error(errorData.message || 'Something went wrong');
    }

    const data = await response.json();
    console.log('Sign-up response data:', data);
    return data;
  } catch (error) {
    console.error('Error in sign-up request:', error);
    throw error;
  }
};