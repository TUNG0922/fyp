from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from bson.objectid import ObjectId
import datetime

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
print(list(join_activity_collection.find()))  # This should return the documents in the collection

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([name, email, password, role]):
        return jsonify({'message': 'All fields are required'}), 400

    if volunteers_collection.find_one({'email': email}):
        return jsonify({'message': 'User already exists'}), 400

    hashed_password = generate_password_hash(password)

    try:
        volunteers_collection.insert_one({
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': role
        })
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'An error occurred while registering the user', 'error': str(e)}), 500

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([email, password, role]):
        return jsonify({'message': 'Email, password, and role are required'}), 400

    user = volunteers_collection.find_one({'email': email})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not check_password_hash(user['password'], password):
        return jsonify({'message': 'Invalid password'}), 401

    if user['role'] != role:
        return jsonify({'message': 'Role mismatch'}), 403

    return jsonify({
        'message': 'Sign-in successful',
        'userId': str(user['_id']),
        'username': user['name'],
        'role': user['role']
    }), 200

@app.route('/api/add_activity', methods=['POST'])
def add_activity():
    data = request.json
    name = data.get('name')
    location = data.get('location')
    date = data.get('date')
    description = data.get('description')
    imageUri = data.get('imageUri')
    user_id = data.get('userId')  # Get user ID from the request

    if not all([name, location, date, description, imageUri, user_id]):
        return jsonify({'message': 'All fields are required'}), 400

    try:
        activities_collection.insert_one({
            'name': name,
            'location': location,
            'date': date,
            'description': description,
            'imageUri': imageUri,
            'userId': user_id  # Add user ID to the activity
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

    # Extract and validate input data, including activity_user_id
    required_fields = ['user_id', 'username', 'email', 'activity_id', 'activity_name', 'location', 'date', 'image', 'activity_user_id']
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
        })

        # Create a notification for the user
        notifications_collection.insert_one({
            'user_id': user_id,
            'message': f'You have joined the activity "{activity_name}".',
            'activity_id': activity_id,
            'activity_name': activity_name,
            'activity_user_id': activity_user_id,  # Include activity_user_id here
            'timestamp': datetime.datetime.now()
        })

        # Create a notification for the organization admin in the new "notification_organizationadmin" collection
        notifications_organizationadmin_collection.insert_one({
            'user_id': activity_user_id,  # The organization admin's ID
            'message': f'User "{username}" has applied to joined your activity "{activity_name}".',
            'activity_id': activity_id,
            'activity_name': activity_name,
            'activity_user_id': activity_user_id,  # Include the activity userId
            'timestamp': datetime.datetime.now()
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

@app.route('/api/delete_review', methods=['POST'])
def delete_review():
    data = request.get_json()
    review_id = data.get('review_id')

    if not review_id:
        return jsonify({'message': 'Review ID is required'}), 400

    if not ObjectId.is_valid(review_id):
        return jsonify({'message': 'Invalid Review ID format'}), 400

    try:
        result = reviews_collection.delete_one({'_id': ObjectId(review_id)})
        if result.deleted_count:
            return jsonify({'message': 'Review deleted successfully'}), 200
        else:
            return jsonify({'message': 'Review not found'}), 404
    except Exception as e:
        return jsonify({'message': 'An error occurred while deleting the review', 'error': str(e)}), 500

@app.route('/api/update_profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'message': 'User ID is required'}), 400

    if not ObjectId.is_valid(user_id):
        return jsonify({'message': 'Invalid User ID format'}), 400

    # Prepare an update dictionary
    update_data = {}
    if 'name' in data and data['name']:
        update_data['name'] = data['name']
    if 'email' in data and data['email']:
        update_data['email'] = data['email']
    if 'password' in data and data['password']:
        update_data['password'] = data['password']

    # Ensure there is at least one field to update
    if not update_data:
        return jsonify({'message': 'No fields to update'}), 400

    try:
        volunteers_collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'An error occurred while updating the profile', 'error': str(e)}), 500

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
                'email': activity.get('email', '')         # Add email
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

if __name__ == '__main__':
    app.run(debug=True)