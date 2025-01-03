from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from bson.objectid import ObjectId
from datetime import datetime, timezone  # Ensure timezone is imported
from pymongo.errors import PyMongoError
import logging
from bson.json_util import dumps
import joblib
import numpy as np
import pandas as pd  # Import Pandas at the beginning

app = Flask(__name__)

# Update the MongoDB URI to include your database name
app.config["MONGO_URI"] = "mongodb+srv://tungjinyou:O1sVhWFc79iEyxSz@cluster0.ufrs5.mongodb.net/volunteerlinks?retryWrites=true&w=majority"
mongo = PyMongo(app)

# Check connection to MongoDB
try:
    mongo.db.command("ping")
    print("Successfully connected to MongoDB!")
except Exception as e:
    print("Failed to connect to MongoDB:", e)

# Enable CORS
CORS(app)

# Get the collections
volunteers_collection = mongo.db.volunteers
activities_collection = mongo.db.activities
join_activity_collection = mongo.db.join_activity
reviews_collection = mongo.db.reviews
notifications_collection = mongo.db.notifications
notifications_organizationadmin_collection = mongo.db.notification_organizationadmin  # New collection for organization admin notifications

# Define the completed_joined_activity and past_activity collections
completed_joined_activity_collection = mongo.db.completed_joined_activity
past_activity_collection = mongo.db.past_activity  # New collection for past activities

# Create the messages collection
messages_collection = mongo.db.messages  # New collection for chat messages
reply_messages_collection = mongo.db.replyMessages  # New collection for reply messages

# Print documents in join_activity_collection
print("Documents in join_activity_collection:")
print(list(join_activity_collection.find()))

# Print documents in past_activity_collection
print("Documents in past_activity_collection:")
print(list(past_activity_collection.find()))

# Load the trained model and other necessary files
model_path = 'train_model/improved_genre_model.pkl'
interests_path = 'train_model/all_interests.pkl'
strengths_path = 'train_model/all_strengths.pkl'

model = joblib.load(model_path)
all_interests = joblib.load(interests_path)
all_strengths = joblib.load(strengths_path)

@app.route('/api/predict_genre', methods=['POST'])
def predict_genre_route():
    try:
        # Get JSON input
        data = request.json

        # Log the received data
        print('Received data:', data)

        # Validate input
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid input format. Must be a JSON object.'}), 400

        # Use correct key names
        interests = data.get('interest', [])  # Changed 'Interests' to 'interest'
        strengths = data.get('strength', [])  # Changed 'Strengths' to 'strength'

        # Track the values of interests and strengths
        print("Debug - Extracted Interests:", interests)
        print("Debug - Extracted Strengths:", strengths)

        if not isinstance(interests, list) or not isinstance(strengths, list):
            return jsonify({'error': 'Interests and strengths must be arrays.'}), 400
        if not interests or not strengths:
            return jsonify({'error': 'Interests and strengths must not be empty.'}), 400

        # Validate interests and strengths against the loaded categories
        invalid_interests = [i for i in interests if i not in all_interests]
        invalid_strengths = [s for s in strengths if s not in all_strengths]

        if invalid_interests:
            return jsonify({'error': f"Invalid interests: {', '.join(invalid_interests)}"}), 400
        if invalid_strengths:
            return jsonify({'error': f"Invalid strengths: {', '.join(invalid_strengths)}"}), 400

        # Combine interests and strengths into a single input
        input_features = [
            1 if i in interests else 0 for i in all_interests
        ] + [
            1 if s in strengths else 0 for s in all_strengths
        ]

        # Predict using the model
        genre_pred = model.predict([input_features])  # Input passed as a list
        genre_pred_result = genre_pred[0]  # Extract the prediction from the array

        return jsonify({'genre': genre_pred_result})

    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_interest_strength', methods=['POST'])
def get_interest_strength():
    data = request.json
    activity_id = data.get('activity_id')
    username = data.get('username')
    email = data.get('email')

    activity_id = ObjectId(activity_id)  # Ensure activity_id is an ObjectId

    # Query the volunteer collection
    result = mongo.db.join_activity.find_one({
        '_id': activity_id,
        'username': username,
        'email': email
    })

    print(f"Querying volunteer collection with: activity_id={activity_id}, username={username}, email={email}")
    print(f"Query result: {result}")

    if result:
        # Safeguard with default empty list in case 'interest' or 'strength' is None
        interests = result.get('interest', [])
        strengths = result.get('strength', [])

        # Ensure interests and strengths are lists
        if isinstance(interests, list):
            interest = interests
        else:
            interest = []

        if isinstance(strengths, list):
            strength = strengths
        else:
            strength = []

        return jsonify({
            'interest': interest,
            'strength': strength
        })
    else:
        return jsonify({'error': 'Record not found'}), 404
    
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    print(f"Received data: {data}")  # Log received data

    # Extract data fields from the request
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    interest = data.get('interest', '')  # New field
    strength = data.get('strength', '')  # Default to empty if not provided
    previous_experiences = data.get('previous_experiences', '')  # Default to empty if not provided

    # Log extracted fields for debugging
    print(f"Name: {name}, Email: {email}, Role: {role}, Interest: {interest}, Strength: {strength}, Previous Experiences: {previous_experiences}")

    # Validate required fields
    if not all([name, email, password, role]):
        return jsonify({'message': 'All fields are required'}), 400

    # Check if user already exists
    if volunteers_collection.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 400

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Prepare the user data for insertion
    user_data = {
        'name': name,
        'email': email,
        'password': hashed_password,
        'role': role,
        'interest': interest if role == 'Volunteer' else None,  # Include Interest only for Volunteers
        'strength': strength if role == 'Volunteer' else None,  # Include Strength only for Volunteers
        'previous_experiences': previous_experiences if role == 'Volunteer' else None  # Include Previous Experiences only for Volunteers
    }

    # Log the user data being inserted
    print(f"User data to be inserted: {user_data}")

    # Insert user data into the database
    try:
        volunteers_collection.insert_one(user_data)
        print("User registered successfully")  # Log successful registration
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        print(f"Error during registration: {str(e)}")  # Log error
        return jsonify({'message': 'An error occurred while registering the user', 'error': str(e)}), 500
    
@app.route('/api/signin', methods=['POST'])
def signin():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        # Verify all fields are present
        if not all([email, password, role]):
            return jsonify({'message': 'Email, password, and role are required'}), 400

        # Fetch user from 'volunteers' collection based on email
        user = volunteers_collection.find_one({'email': email})
        
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Check if provided password matches the stored password hash
        stored_password_hash = user.get('password')
        if not stored_password_hash or not check_password_hash(stored_password_hash, password):
            return jsonify({'message': 'Invalid password'}), 401

        # Check if role matches user's role in the database
        if user.get('role') != role:
            return jsonify({'message': 'Role mismatch'}), 403

        # Include additional fields in the response based on role
        if role == 'organization admin':
            response_data = {
                'message': 'Sign-in successful',
                'userId': str(user['_id']),
                'username': user.get('name', 'N/A'),
                'role': user['role']
            }
        else:
            strength = user.get('strength', [])
            interest = user.get('interest', [])
            previous_experiences = user.get('previous_experiences', '')

            response_data = {
                'message': 'Sign-in successful',
                'userId': str(user['_id']),
                'username': user.get('name', 'N/A'),
                'role': user['role'],
                'strength': strength,
                'interest': interest,
                'previous_experiences': previous_experiences
            }

        return jsonify(response_data), 200

    except PyMongoError as e:
        # Handle any database-related errors
        print(f"Database error: {e}")
        return jsonify({'message': 'Database error occurred'}), 500
    except Exception as e:
        # Handle any other unexpected errors
        print(f"Unexpected error: {e}")
        return jsonify({'message': 'An unexpected error occurred'}), 500

@app.route('/api/add_activity', methods=['POST'])
def add_activity():
    data = request.json
    name = data.get('name')
    location = data.get('location')
    date = data.get('date')
    description = data.get('description')
    imageUri = data.get('imageUri')
    user_id = data.get('userId')  # Get user ID from the request
    genre = data.get('genre')  # Get genre from the request

    # Validate all required fields
    if not all([name, location, date, description, imageUri, user_id, genre]):
        return jsonify({'message': 'All fields are required'}), 400

    try:
        # Insert data into MongoDB collection
        activities_collection.insert_one({
            'name': name,
            'location': location,
            'date': date,
            'description': description,
            'imageUri': imageUri,
            'userId': user_id,
            'genre': genre  # Add genre to the activity
        })
        return jsonify({"message": "Activity added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    try:
        activities = list(activities_collection.find())
        for activity in activities:
            activity['_id'] = str(activity['_id'])
        return jsonify(activities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activity/<activity_id>', methods=['GET'])
def get_activity(activity_id):
    try:
        if not ObjectId.is_valid(activity_id):
            return jsonify({'message': 'Invalid activity ID'}), 400

        activity = activities_collection.find_one({'_id': ObjectId(activity_id)})
        if activity:
            activity['_id'] = str(activity['_id'])
            return jsonify(activity), 200
        else:
            return jsonify({'message': 'Activity not found'}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/join_activity', methods=['POST'])
def join_activity():
    data = request.get_json()

    # Extract and validate input data, including activity_user_id and interest
    required_fields = [
        'user_id', 'username', 'email', 'activity_id', 'activity_name', 
        'location', 'date', 'image', 'activity_user_id', 
        'strength', 'previous_experiences', 'interest','genre'
    ]
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'All fields are required'}), 400

    user_id = data['user_id']
    username = data['username']
    email = data['email']
    activity_id = data['activity_id']
    activity_name = data['activity_name']
    location = data['location']
    date = data['date']
    image = data['image']
    activity_user_id = data['activity_user_id']  # Extract organization admin ID as activity_user_id
    strength = data['strength']
    previous_experiences = data['previous_experiences']
    interest = data['interest']  # New field for interest
    genre = data['genre']  # New field for genre

    try:
        # Get the activity to retrieve its organization_admin_id
        activity = activities_collection.find_one({'_id': ObjectId(activity_id)})
        if activity is None:
            return jsonify({'message': 'Activity not found'}), 404

        # Check if the user has already joined this activity
        if join_activity_collection.find_one({'user_id': user_id, 'activity_id': activity_id}):
            return jsonify({'message': 'You have already joined this activity.'}), 409

        # Insert the activity join record
        join_activity_collection.insert_one({
            'user_id': user_id,
            'username': username,
            'email': email,
            'activity_id': activity_id,
            'activity_name': activity_name,
            'location': location,
            'date': date,
            'image': image,
            'activity_user_id': activity_user_id,  # Store the provided activity_user_id
            'strength': strength,                  # Include strength
            'previous_experiences': previous_experiences,  # Include previous_experiences
            'interest': interest,                   # Include interest
            'genre': genre                           # Include genre
        })

        # Create a notification for the user
        notifications_collection.insert_one({
            'user_id': user_id,
            'message': f'You have applied to join the activity "{activity_name}". Your application is pending, Please wait.',
            'activity_id': activity_id,
            'activity_name': activity_name,
            'genre': genre,  # Include genre
            'activity_user_id': activity_user_id,  # Include activity_user_id here
            'timestamp': datetime.now(timezone.utc)  # Use timezone-aware timestamp
        })

        # Create a notification for the organization admin
        notifications_organizationadmin_collection.insert_one({
            'user_id': activity_user_id,  # The organization admin's ID
            'message': f'User "{username}" has applied to join your activity "{activity_name}".',
            'activity_id': activity_id,
            'activity_name': activity_name,
            'genre': genre,               # Include genre in organization admin notification
            'interest': interest,         # Include interest for organization admin notification
            'timestamp': datetime.now(timezone.utc)  # Use timezone-aware timestamp
        })

        return jsonify({'message': 'Activity joined successfully!'}), 201

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Log the error for debugging
        return jsonify({'message': 'Error joining activity', 'error': str(e)}), 500

@app.route('/api/check_join_status', methods=['POST'])
def check_join_status():
    data = request.get_json()
    user_id = data.get('user_id')
    activity_id = data.get('activity_id')

    if not user_id or not activity_id:
        return jsonify({'message': 'User ID and Activity ID are required'}), 400

    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(activity_id):
        return jsonify({'message': 'Invalid User ID or Activity ID format'}), 400

    try:
        join_record = join_activity_collection.find_one({'user_id': user_id, 'activity_id': activity_id})

        return jsonify({'hasJoined': bool(join_record)}), 200
    except Exception as e:
        return jsonify({'message': 'An error occurred while checking join status', 'error': str(e)}), 500

@app.route('/api/add_review', methods=['POST'])
def add_review():
    data = request.json
    new_review = {
        "text": data.get('text'),
        "date": data.get('date'),
        "rating": data.get('rating'),
        "activity_id": data.get('activity_id'),
        "user_id": data.get('user_id'),
        "name": data.get('name'),
    }
    
    if not all([new_review["text"], new_review["date"], new_review["rating"], new_review["activity_id"], new_review["user_id"], new_review["name"]]):
        return jsonify({'message': 'All fields are required'}), 400

    try:
        result = reviews_collection.insert_one(new_review)
        return jsonify({"success": True, "review_id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/get_reviews', methods=['GET'])
def get_reviews():
    activity_id = request.args.get('activityId')
    if not activity_id:
        return jsonify({'message': 'Activity ID is required'}), 400

    reviews = reviews_collection.find({'activity_id': activity_id})
    reviews_list = [{'text': r['text'], 'date': r['date'], 'rating': r['rating'], 'name': r['name'], '_id': str(r['_id'])} for r in reviews]
    return jsonify({'reviews': reviews_list}), 200

@app.route('/api/delete_review/<review_id>', methods=['DELETE'])
def delete_review(review_id):
    # Check if the review_id is valid
    if not ObjectId.is_valid(review_id):
        return jsonify({'message': 'Invalid Review ID format'}), 400

    try:
        # Attempt to delete the review from the database
        result = reviews_collection.delete_one({'_id': ObjectId(review_id)})
        if result.deleted_count:
            return jsonify({'message': 'Review deleted successfully'}), 200
        else:
            return jsonify({'message': 'Review not found'}), 404
    except Exception as e:
        return jsonify({'message': 'An error occurred while deleting the review', 'error': str(e)}), 500

@app.route('/api/update_profile', methods=['PUT'])
def update_profile():
    data = request.json
    user_id = data.get('user_id')
    new_password = data.get('password')

    if not user_id or not new_password:
        return jsonify({'message': 'Missing user_id or password'}), 400

    try:
        # Convert user_id to ObjectId
        user_id_obj = ObjectId(user_id)
    except:
        return jsonify({'message': 'Invalid user_id format'}), 400

    # Hash the new password before updating
    hashed_password = generate_password_hash(new_password)

    # Update the password in the database
    result = volunteers_collection.update_one(
        {'_id': user_id_obj},
        {'$set': {'password': hashed_password}}
    )

    if result.matched_count > 0:
        return jsonify({'message': 'Password updated successfully'}), 200
    else:
        return jsonify({'message': 'User not found'}), 404

@app.route('/api/pending_activities/<user_id>', methods=['GET'])
def get_pending_activities(user_id):
    if not ObjectId.is_valid(user_id):
        return jsonify({'message': 'Invalid User ID format'}), 400

    try:
        pending_activities = list(join_activity_collection.find({'user_id': user_id}))
        for activity in pending_activities:
            activity['_id'] = str(activity['_id'])  # Convert ObjectId to string
        return jsonify(pending_activities), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching pending activities', 'error': str(e)}), 500
    
@app.route('/api/joined_activities/<user_id>', methods=['GET'])
def get_joined_activities(user_id):
    print("Received request for user ID:", user_id)  # Debug line

    # Validate the user ID format
    if not ObjectId.is_valid(user_id):
        return jsonify({'message': 'Invalid User ID format'}), 400

    try:
        # Query the join_activity collection for the user's activities
        joined_activities = list(join_activity_collection.find({'activity_user_id': user_id}))

        # Check if there are any joined activities
        if not joined_activities:
            return jsonify({'message': 'No joined activities found for this user.'}), 404

        # Prepare the response with activity details including username and email
        response_data = []
        for activity in joined_activities:
            # Convert ObjectId to string for JSON serialization
            activity['_id'] = str(activity['_id'])
            response_data.append({
                'activity_id': activity['_id'],
                'activity_name': activity.get('activity_name', ''),
                'location': activity.get('location', ''),
                'date': activity.get('date', ''),
                'image': activity.get('image', ''),
                'username': activity.get('username', ''),  # Add username
                'email': activity.get('email', ''),        # Add email
                'genre': activity.get('genre', '')         # Add genre
            })

        return jsonify(response_data), 200

    except Exception as e:
        print("Error fetching activities:", str(e))  # Debug line
        return jsonify({'message': 'Error fetching joined activities', 'error': str(e)}), 500

@app.route('/api/delete_activity/<activity_id>', methods=['DELETE'])
def delete_activity(activity_id):
    if not ObjectId.is_valid(activity_id):
        return jsonify({'message': 'Invalid activity ID format'}), 400

    try:
        result = activities_collection.delete_one({'_id': ObjectId(activity_id)})
        if result.deleted_count:
            return jsonify({'message': 'Activity deleted successfully'}), 200
        else:
            return jsonify({'message': 'Activity not found'}), 404
    except Exception as e:
        return jsonify({'message': 'Error deleting activity', 'error': str(e)}), 500
    
@app.route('/api/pending_notifications/<user_id>', methods=['GET'])
def get_pending_notifications(user_id):
    if not ObjectId.is_valid(user_id):
        return jsonify({'message': 'Invalid User ID format'}), 400

    try:
        # Fetch pending activities for the user
        pending_activities = list(join_activity_collection.find({'user_id': user_id, 'status': 'pending'}))
        
        # Prepare a list to hold notifications with activity details
        notifications = []
        for activity in pending_activities:
            activity['_id'] = str(activity['_id'])  # Convert ObjectId to string
            
            # Retrieve activity details based on activity ID
            activity_details = activities_collection.find_one({'_id': ObjectId(activity['activity_id'])})
            if activity_details:
                notifications.append({
                    'message': f'User with ID "{user_id}" has joined the activity "{activity_details["name"]}".',
                    'activity_id': activity['_id'],  # Include the activity ID here
                    'timestamp': datetime.datetime.now().isoformat()  # You can customize the timestamp as needed
                })

        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching pending notifications', 'error': str(e)}), 500

@app.route('/api/add_notification', methods=['POST'])
def add_notification():
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    activity_id = data.get('activity_id')
    activity_name = data.get('activity_name')

    # Ensure activity_id and activity_name are not null
    notification = {
        'user_id': user_id,
        'message': message,
        'timestamp': datetime.datetime.now(),
    }

    # Add activity details if they are not null
    if activity_id is not None:
        notification['activity_id'] = activity_id
    if activity_name is not None:
        notification['activity_name'] = activity_name

    try:
        notifications_collection.insert_one(notification)  # Insert into MongoDB
        return jsonify({'status': 'success', 'notification_id': str(notification['_id'])}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/notifications/<user_id>', methods=['GET'])
def get_notifications(user_id):
    if not ObjectId.is_valid(user_id):
        return jsonify({'message': 'Invalid User ID format'}), 400

    try:
        notifications = list(notifications_collection.find({'user_id': user_id}))
        for notification in notifications:
            notification['_id'] = str(notification['_id'])  # Convert ObjectId to string
        return jsonify(notifications), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching notifications', 'error': str(e)}), 500

@app.route('/api/notifications/organization_admin/<user_id>', methods=['GET'])
def get_notifications_organization_admin(user_id):
    try:
        # Retrieve notifications for the organization admin from the 'notification_organizationadmin' collection
        notifications = list(notifications_organizationadmin_collection.find({'user_id': user_id}))
        
        # Convert ObjectId to string for JSON serialization
        for notification in notifications:
            notification['_id'] = str(notification['_id'])
        
        return jsonify(notifications), 200
    except Exception as e:
        print(f"Error fetching organization admin notifications: {str(e)}")
        return jsonify({'error': 'Failed to fetch notifications'}), 500
    
@app.route('/api/activities/<user_id>', methods=['GET'])
def get_activities_by_user(user_id):
    activities = mongo.db.activities.find({"userId": user_id})  # Adjust the query based on your schema
    return jsonify([activity for activity in activities])

@app.route('/api/edit_activity', methods=['PUT'])
def edit_activity():
    try:
        data = request.get_json()
        activity_id = data.get('_id')

        # Perform validation, check for null fields, etc.
        if not activity_id:
            return jsonify({'error': 'Activity ID is required'}), 400
        
        # Assuming you're using MongoDB
        activities_collection.update_one(
            {'_id': ObjectId(activity_id)},
            {
                '$set': {
                    'name': data['name'],
                    'location': data['location'],
                    'date': data['date'],
                    'description': data['description']
                }
            }
        )
        return jsonify({'message': 'Activity updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/accept_activity', methods=['POST'])
def accept_activity():
    try:
        # Access JSON payload
        data = request.json
        join_activity_id = data.get("join_activity_id")

        if not join_activity_id:
            return jsonify({"error": "Activity ID is required"}), 400

        # Validate ObjectId
        try:
            object_id = ObjectId(join_activity_id)
        except Exception as e:
            return jsonify({"error": "Invalid Activity ID format"}), 400

        # Find the activity in the join_activity collection
        activity = join_activity_collection.find_one({"_id": object_id})
        if not activity:
            return jsonify({"error": "Activity not found"}), 404

        # Move the activity to the completed collection
        completed_joined_activity_collection.insert_one(activity)

        # Remove the activity from the join_activity collection
        join_activity_collection.delete_one({"_id": object_id})

        # Extract details for notifications
        user_id = activity.get("user_id")
        activity_name = activity.get("activity_name", "Unnamed Activity")
        activity_user_id = activity.get("activity_user_id")  # Updated field name
        user_name = activity.get("username", "Unknown User")

        # Save notification for activity admin
        activity_admin_notification = {
            "user_id": activity_user_id,  # Updated field name
            "message": f"You have accepted {user_name} for the activity: {activity_name}",
            "activity_id": join_activity_id,
            "timestamp": datetime.utcnow()
        }
        notifications_organizationadmin_collection.insert_one(activity_admin_notification)

        # Save notification for the user
        user_notification = {
            "user_id": user_id,
            "message": f"You have been accepted for joining the activity: {activity_name}",
            "activity_id": join_activity_id,
            "timestamp": datetime.utcnow()
        }
        notifications_collection.insert_one(user_notification)

        return jsonify({"message": "Activity moved to completed and notifications created"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/completed_joined_activity/<user_id>', methods=['GET'])
def get_completed_activities(user_id):
    try:
        activities = completed_joined_activity_collection.find({'user_id': user_id})
        activities_list = []
        
        for activity in activities:
            activity['_id'] = str(activity['_id'])
            
            # Ensure 'image' field exists and format it for front-end
            if 'image' in activity and activity['image']:
                # If it's a local file, ensure it's accessible through a URL
                activity['image_url'] = activity['image']  # assuming this is the URL or path to the image
            else:
                activity['image_url'] = None  # or provide a default image URL

            activities_list.append(activity)
        
        return jsonify(activities_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/complete_activity/<activity_id>', methods=['POST'])
def complete_activity(activity_id):
    try:
        # Fetch the activity from the completed_joined_activity collection
        activity = completed_joined_activity_collection.find_one({"_id": ObjectId(activity_id)})
        if not activity:
            return jsonify({"error": "Activity not found"}), 404

        # Insert the activity into the past_activity collection
        past_activity_collection.insert_one(activity)

        # Remove the activity from completed_joined_activity
        completed_joined_activity_collection.delete_one({"_id": ObjectId(activity_id)})

        # Notification for the user
        user_notification = {
            "user_id": activity.get("user_id"),  # Assuming `user_id` is part of the activity document
            "activity_id": activity_id,
            "message": f"You have completed the activity: {activity.get('activity_name', 'Unnamed Activity')}",
            "timestamp": datetime.utcnow()
        }
        notifications_collection.insert_one(user_notification)

        # Notification for the organization admin
        org_admin_notification = {
            "_id": ObjectId(),  # Generate a unique ID for the notification
            "user_id": activity.get("user_id"),  # User ID of the person who completed the activity
            "message": f"User {activity.get('username', 'Unknown User')} has completed the activity {activity.get('activity_name', 'Unnamed Activity')}.",
            "activity_id": activity_id,
            "activity_name": activity.get("activity_name", "Unnamed Activity"),
            "timestamp": datetime.utcnow()
        }

        # Insert into the `notification_organizationadmin` collection
        notifications_organizationadmin_collection.insert_one(org_admin_notification)

        return jsonify({"message": "Activity moved to past_activity successfully and notifications created"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/past_activities', methods=['GET'])
def get_past_activities():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        # Fetch activities based on user_id
        activities = mongo.db.past_activity.find({"user_id": user_id})
        
        # Convert activities to a list and serialize ObjectId to string
        activities_list = [activity for activity in activities]

        # Use bson.json_util.dumps to convert MongoDB documents to JSON-serializable format
        activities_json = dumps(activities_list)  # This will convert ObjectId to string

        return activities_json, 200  # Return the JSON response
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@app.route('/api/sendMessage', methods=['POST'])
def send_message():
    data = request.get_json()

    # Validate the incoming data
    if not data or not data.get('message') or not data.get('userId') or not data.get('activityId'):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400

    # Construct the message document to insert into the database
    message = {
        'userId': data['userId'],
        'activityId': data['activityId'],
        'activity_user_id': data.get('activity_user_id'),  # Include the activity_user_id
        'message': data['message'],
        'name': data['name'],
        'role': data['role'],
        'createdAt': datetime.utcnow()  # Use UTC time for consistency
    }

    try:
        # Insert the message into the messages collection in MongoDB
        result = messages_collection.insert_one(message)

        # Return success response
        return jsonify({'success': True, 'message': 'Message sent successfully'}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/getMessages/<activity_id>/<user_id>', methods=['GET'])
def get_messages(activity_id, user_id):
    try:
        # Log the received parameters for debugging
        print(f"Received activity_id: {activity_id}")
        print(f"Received user_id: {user_id}")

        # Validate the activityId and userId
        if not activity_id or not user_id:
            print("Error: activity_id or user_id is missing")
            return jsonify({'error': 'activityId and userId are required'}), 400

        # Query the messages collection to find messages based on activityId and userId
        messages = messages_collection.find({'activityId': activity_id, 'userId': user_id})

        # Convert MongoDB cursor to list and format data for the frontend
        messages_list = []
        for msg in messages:
            print(f"Processing message: {msg}")  # Log each message for debugging
            messages_list.append({
                '_id': str(msg['_id']),  # Convert ObjectId to string
                'userId': msg.get('userId', ''),
                'activityId': msg.get('activityId', ''),
                'message': msg.get('message', ''),
                'name': msg.get('name', ''),
                'role': msg.get('role', ''),
                'createdAt': str(msg.get('createdAt', ''))  # Convert to string for frontend
            })

        # Log the final list to verify the processed messages
        print("Final messages list:", messages_list)

        # Return the messages as a JSON response
        return jsonify(messages_list), 200

    except Exception as e:
        # Log any exception that occurs
        print(f"Error in get_messages: {e}")
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500
    
@app.route('/api/reject_activity', methods=['POST'])
def reject_activity():
    try:
        print("Raw data received:", request.data)
        data = request.json
        print("Parsed JSON data:", data)

        join_activity_id = data.get("join_activity_id")
        if not join_activity_id:
            return jsonify({"error": "Activity ID is required"}), 400

        try:
            object_id = ObjectId(join_activity_id)
        except Exception as e:
            print("Invalid ObjectId:", e)
            return jsonify({"error": "Invalid Activity ID format"}), 400

        activity = join_activity_collection.find_one({"_id": object_id})
        if not activity:
            print("Activity not found for ID:", join_activity_id)
            return jsonify({"error": "Activity not found"}), 404

        activity_name = activity.get("activity_name", "Unknown Activity")
        username = activity.get("username", "Unknown User")

        print("Deleting activity:", activity)
        join_activity_collection.delete_one({"_id": object_id})

        notification_data = {
            "user_id": activity["user_id"],
            "message": f"Your application for the activity '{activity_name}' was rejected.",
            "activity_id": join_activity_id,
            "timestamp": datetime.utcnow(),
        }
        print("User notification data:", notification_data)
        notifications_collection.insert_one(notification_data)

        organization_admin_notification = {
            "user_id": activity["activity_user_id"],
            "message": f"The activity '{activity_name}' by user '{username}' was rejected.",
            "timestamp": datetime.utcnow(),
        }
        print("Admin notification data:", organization_admin_notification)
        notifications_organizationadmin_collection.insert_one(organization_admin_notification)

        return jsonify({"message": "Activity rejected successfully"}), 200

    except Exception as e:
        print("Error in reject_activity:", e)
        return jsonify({"error": "An error occurred"}), 500

@app.route('/api/getList', methods=['GET'])
def get_user_list():
    activity_id = request.args.get('activityId')
    
    if not activity_id:
        return jsonify({"error": "Activity ID is required"}), 400

    # Log the activity_id for debugging
    print("Received Activity ID:", activity_id)
    
    # If activity_id is passed as a string, no need to convert to ObjectId
    # Directly use it in the query
    
    try:
        # First, try to find completed activities in the completed_joined_activity collection
        completed_activities_cursor = completed_joined_activity_collection.find({"activity_id": activity_id})
        completed_activities = list(completed_activities_cursor)
        
        # If no completed activities found, try searching in the past_activity collection
        if not completed_activities:
            print("No completed activities found, searching in the past_activity collection...")
            completed_activities_cursor = past_activity_collection.find({"activity_id": activity_id})
            completed_activities = list(completed_activities_cursor)
        
        print("Completed Activities Retrieved:", completed_activities)  # Log result for debugging
        
        if not completed_activities:
            return jsonify({"error": "No users found that join this activity."}), 404
        
        # Extract the user list (username, email) from the activities
        user_list = [
            {"username": activity.get("username", "Unknown"), "email": activity.get("email", "Unknown")}
            for activity in completed_activities
        ]
        
        return jsonify({"list": user_list}), 200
    except Exception as e:
        print("Error Details:", str(e))
        return jsonify({"error": "An error occurred while fetching the user list.", "details": str(e)}), 500
    
@app.route('/api/getMessagesList', methods=['GET'])
def get_messages_list():
    activity_id = request.args.get('activityId')  # Get activityId from query parameters
    print(f"Received activityId: {activity_id}")  # Debug log
    
    if not activity_id:
        return jsonify({'error': 'activityId is required'}), 400

    try:
        # Fetch all messages for the given activityId
        messages_cursor = mongo.db.messages.find({"activityId": activity_id})
        messages_list = []
        seen_user_ids = set()  # Track unique userIds

        for msg in messages_cursor:
            user_id = msg.get("userId")
            # Add to the list only if the userId is unique
            if user_id and user_id not in seen_user_ids:
                seen_user_ids.add(user_id)
                messages_list.append({
                    "userId": user_id,  # Include the unique userId
                    "name": msg.get("name", "Unknown"),  # Fallback name if not available
                    "_id": str(msg["_id"]),  # Convert _id to string
                })

        print(f"Filtered Messages: {messages_list}")  # Debug log
        return jsonify({'messages': messages_list}), 200  # Send filtered messages

    except Exception as e:
        # Log the exception for debugging
        print(f"Error retrieving messages: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
    
@app.route('/api/reply_to_review', methods=['POST'])
def reply_to_review():
    data = request.json
    review_id = data.get('reviewId')
    reply_text = data.get('replyText')

    if not review_id or not reply_text:
        return jsonify({'error': 'Missing reviewId or replyText'}), 400

    try:
        # Ensure review_id is a valid ObjectId
        if not ObjectId.is_valid(review_id):
            return jsonify({'error': 'Invalid reviewId'}), 400

        # Save the reply in the `replyMessages` collection
        reply_entry = {
            'reviewId': ObjectId(review_id),  # Ensure it is stored as ObjectId
            'replyText': reply_text,
            'timestamp': datetime.utcnow()
        }

        # Insert into the `replyMessages` collection
        mongo.db.replyMessages.insert_one(reply_entry)

        return jsonify({'message': 'Reply saved successfully'}), 200

    except Exception as e:
        # Log the exception and send the error message in the response
        app.logger.error(f"Error occurred while saving reply: {str(e)}")
        return jsonify({'error': f"Internal server error: {str(e)}"}), 500

@app.route('/api/get_replies', methods=['GET'])
def get_replies():
    review_id = request.args.get('reviewId')
    if not review_id:
        return jsonify({"error": "Review ID is required"}), 400

    # Check if the review_id is a valid ObjectId
    if not ObjectId.is_valid(review_id):
        return jsonify({"error": "Invalid Review ID format"}), 400

    # Fetch replies from the database based on review_id
    replies = mongo.db.replyMessages.find({"reviewId": ObjectId(review_id)})

    # Construct a list of replies with detailed information
    reply_list = []
    for reply in replies:
        reply_list.append({
            "replyId": str(reply.get("_id")),  # Convert ObjectId to string
            "text": reply.get("replyText"),    # Changed to 'replyText'
            "author": reply.get("author", "Organization Admin"),  # Default to "Anonymous" if no author
            "timestamp": reply.get("timestamp", "Unknown"),  # Default to "Unknown" if no timestamp
        })

    return jsonify({"replies": reply_list}), 200
    
@app.route('/api/reviews/average', methods=['GET'])
def get_activity_average():
    try:
        # Extract 'activity_id' from the query string
        activity_id = request.args.get('activity_id')

        # Check if 'activity_id' is provided
        if not activity_id:
            return jsonify({"error": "activity_id parameter is required"}), 400

        # Query the MongoDB collection for reviews
        reviews_cursor = reviews_collection.find({"activity_id": activity_id})

        # Convert cursor to a list safely
        reviews = list(reviews_cursor)

        # If no reviews exist for the activity
        if not reviews:
            return jsonify({
                "activityId": activity_id,
                "averageRating": 0,
                "reviewCount": 0,
                "message": "No reviews found for this activity."
            }), 200

        # Extract ratings from the reviews safely
        ratings = [review.get("rating", 0) for review in reviews if "rating" in review]

        # Handle the case of invalid/empty ratings safely
        if not ratings:
            return jsonify({
                "activityId": activity_id,
                "averageRating": 0,
                "reviewCount": 0,
                "message": "No valid ratings found."
            }), 200

        # Calculate average safely
        average_rating = round(sum(ratings) / len(ratings), 2)

        # Define feedback message based on calculated average
        if average_rating >= 4:
            message = "Excellent"
        elif average_rating >= 3:
            message = "Good"
        elif average_rating >= 2:
            message = "Average"
        else:
            message = "Poor"

        # Return data to the frontend
        return jsonify({
            "activityId": activity_id,
            "averageRating": average_rating,
            "reviewCount": len(ratings),
            "message": message
        }), 200

    except Exception as e:
        # Handle unexpected internal server errors
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/get_joined_activity_details', methods=['POST'])
def get_joined_activity_details():
    data = request.json
    name = data.get('name') or data.get('username')
    email = data.get('email')

    if not name or not email:
        app.logger.error(f"Missing name or email: {data}")
        return jsonify({'message': 'Missing name or email'}), 400

    app.logger.info(f"Fetching volunteer details for name: {name}, email: {email}")

    # Query the database
    volunteer = mongo.db.volunteers.find_one({'name': name, 'email': email})
    if not volunteer:
        app.logger.error(f"User not found: name={name}, email={email}")
        return jsonify({'message': 'User not found'}), 404

    # Get previous_experiences, strength, and interest
    previous_experiences = volunteer.get('previous_experiences', None)
    strength = volunteer.get('strength', None)
    interest = volunteer.get('interest', None)

    app.logger.info(f"Fetched volunteer details: previous_experiences={previous_experiences}, strength={strength}, interest={interest}")

    return jsonify({
        'previous_experiences': previous_experiences,
        'strength': strength,
        'interest': interest
    })
    
if __name__ == '__main__':
    app.run(debug=True)