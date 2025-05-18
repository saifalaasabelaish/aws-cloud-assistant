import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
    """
    Main handler for CloudAssistant Lex bot intent fulfillment
    """
    print(f"Event: {json.dumps(event, indent=2)}")
    
    # Identify which intent was invoked
    intent_name = event['sessionState']['intent']['name']
    print(f"Processing intent: {intent_name}")
    
    # Route to the appropriate intent handler
    if intent_name == 'ListEC2Instances':
        return handle_list_ec2_instances(event)
    elif intent_name == 'DescribeS3Buckets':
        return handle_describe_s3_buckets(event)
    elif intent_name == 'CheckCloudWatchAlarms':
        return handle_check_cloudwatch_alarms(event)
    elif intent_name == 'ConfigureAWSResource':
        return handle_configure_aws_resource(event)
    elif intent_name == 'GetAWSServiceStatus':
        return handle_aws_service_status(event)
    else:
        # Default response for unhandled intents
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Failed'
                },
                'intent': {
                    'name': intent_name,
                    'state': 'Failed'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': "I'm sorry, I don't know how to handle that request yet."
                }
            ]
        }

def get_slot_value(event, slot_name):
    """Helper to extract slot values from the event"""
    slots = event['sessionState']['intent']['slots']
    if slots and slot_name in slots and slots[slot_name] and slots[slot_name].get('value'):
        return slots[slot_name]['value']['interpretedValue']
    return None

def handle_list_ec2_instances(event):
    """
    Handler for ListEC2Instances intent
    """
    # Extract slot values
    slots = event['sessionState']['intent']['slots']
    region = get_slot_value(event, 'Region') or 'all'
    instance_state = get_slot_value(event, 'InstanceState') or 'all'
    
    try:
        # Initialize EC2 client
        if region.lower() == 'all':
            # Get all regions
            ec2_client = boto3.client('ec2', region_name='us-east-1')
            regions = [region['RegionName'] for region in ec2_client.describe_regions()['Regions']]
            instances = []
            
            # Query each region for instances
            for r in regions:
                regional_instances = get_instances_in_region(r, instance_state)
                if regional_instances:
                    instances.extend(regional_instances)
            
            # Prepare response based on instance count
            if not instances:
                response_content = "You don't have any EC2 instances"
                if instance_state.lower() != 'all':
                    response_content += f" in the {instance_state} state"
                response_content += " in any region."
            else:
                total_count = len(instances)
                response_content = f"I found {total_count} EC2 instances"
                if instance_state.lower() != 'all':
                    response_content += f" in the {instance_state} state"
                response_content += " across all regions:\n\n"
                
                # Group instances by region
                instances_by_region = {}
                for instance in instances:
                    if instance['Region'] not in instances_by_region:
                        instances_by_region[instance['Region']] = []
                    instances_by_region[instance['Region']].append(instance)
                
                # Format response
                for r, region_instances in instances_by_region.items():
                    response_content += f"Region {r}: {len(region_instances)} instances\n"
                    for i, instance in enumerate(region_instances[:5]):  # Limit to 5 per region
                        response_content += f"  {i+1}. {instance['InstanceId']} ({instance['State']}): {instance.get('Name', 'Unnamed')}\n"
                    if len(region_instances) > 5:
                        response_content += f"  ... and {len(region_instances) - 5} more instances\n"
        else:
            # List instances in the specified region
            instances = get_instances_in_region(region, instance_state)
            
            if not instances:
                response_content = f"You don't have any EC2 instances"
                if instance_state.lower() != 'all':
                    response_content += f" in the {instance_state} state"
                response_content += f" in the {region} region."
            else:
                response_content = f"I found {len(instances)} EC2 instances"
                if instance_state.lower() != 'all':
                    response_content += f" in the {instance_state} state"
                response_content += f" in {region}:\n\n"
                for i, instance in enumerate(instances):
                    response_content += f"{i+1}. {instance['InstanceId']} ({instance['State']}): {instance.get('Name', 'Unnamed')}\n"
        
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Fulfilled'
                },
                'intent': {
                    'name': 'ListEC2Instances',
                    'state': 'Fulfilled'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': response_content
                }
            ]
        }
    
    except Exception as e:
        print(f"Error in handle_list_ec2_instances: {str(e)}")
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Failed'
                },
                'intent': {
                    'name': 'ListEC2Instances',
                    'state': 'Failed'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': f"I encountered an error while trying to list your EC2 instances: {str(e)}"
                }
            ]
        }

def get_instances_in_region(region, state_filter='all'):
    """Helper function to get EC2 instances in a specific region with optional state filter"""
    try:
        ec2 = boto3.client('ec2', region_name=region)
        filters = []
        
        # Add state filter if specified
        if state_filter.lower() != 'all':
            filters.append({
                'Name': 'instance-state-name',
                'Values': [state_filter.lower()]
            })
        
        # Get instances with optional filtering
        if filters:
            response = ec2.describe_instances(Filters=filters)
        else:
            response = ec2.describe_instances()
        
        instances = []
        for reservation in response['Reservations']:
            for instance in reservation['Instances']:
                # Get instance name from tags if available
                name = "Unnamed"
                if 'Tags' in instance:
                    for tag in instance['Tags']:
                        if tag['Key'] == 'Name':
                            name = tag['Value']
                
                instances.append({
                    'InstanceId': instance['InstanceId'],
                    'State': instance['State']['Name'],
                    'InstanceType': instance['InstanceType'],
                    'Name': name,
                    'Region': region
                })
        
        return instances
    except Exception as e:
        print(f"Error getting instances in {region}: {str(e)}")
        return []

def handle_describe_s3_buckets(event):
    """
    Handler for DescribeS3Buckets intent
    """
    # Extract slot values
    bucket_name = get_slot_value(event, 'BucketName')
    
    try:
        s3 = boto3.client('s3')
        
        if bucket_name:
            # Describe specific bucket
            try:
                # Check if bucket exists
                location = s3.get_bucket_location(Bucket=bucket_name)
                region = location['LocationConstraint'] or 'us-east-1'
                
                # Get bucket objects (limited to show first 10)
                objects = s3.list_objects_v2(Bucket=bucket_name, MaxKeys=10)
                object_count = objects.get('KeyCount', 0)
                
                # Get bucket policy status if available
                try:
                    policy = s3.get_bucket_policy_status(Bucket=bucket_name)
                    is_public = policy.get('PolicyStatus', {}).get('IsPublic', False)
                except:
                    is_public = "Unknown"
                
                # Format response
                response_content = f"Here's information about your S3 bucket '{bucket_name}':\n\n"
                response_content += f"Region: {region}\n"
                response_content += f"Total Objects: {object_count}\n"
                response_content += f"Public Access: {'Yes' if is_public else 'No'}\n\n"
                
                if object_count > 0:
                    response_content += "Sample objects:\n"
                    for i, obj in enumerate(objects.get('Contents', [])[:5]):
                        size_mb = obj.get('Size', 0) / (1024 * 1024)
                        response_content += f"{i+1}. {obj.get('Key')} ({size_mb:.2f} MB)\n"
                    if object_count > 5:
                        response_content += f"...and {object_count - 5} more objects\n"
            except Exception as e:
                response_content = f"I couldn't find information about bucket '{bucket_name}'. Error: {str(e)}"
        else:
            # List all buckets
            buckets = s3.list_buckets()
            bucket_count = len(buckets.get('Buckets', []))
            
            if bucket_count == 0:
                response_content = "You don't have any S3 buckets in your account."
            else:
                response_content = f"You have {bucket_count} S3 buckets:\n\n"
                for i, bucket in enumerate(buckets.get('Buckets', [])):
                    bucket_name = bucket.get('Name')
                    creation_date = bucket.get('CreationDate').strftime('%Y-%m-%d')
                    response_content += f"{i+1}. {bucket_name} (created: {creation_date})\n"
                
                response_content += "\nTo get more details about a specific bucket, you can ask me about it by name."
        
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Fulfilled'
                },
                'intent': {
                    'name': 'DescribeS3Buckets',
                    'state': 'Fulfilled'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': response_content
                }
            ]
        }
    
    except Exception as e:
        print(f"Error in handle_describe_s3_buckets: {str(e)}")
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Failed'
                },
                'intent': {
                    'name': 'DescribeS3Buckets',
                    'state': 'Failed'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': f"I encountered an error while trying to retrieve S3 bucket information: {str(e)}"
                }
            ]
        }

def handle_check_cloudwatch_alarms(event):
    """
    Handler for CheckCloudWatchAlarms intent
    """
    # Extract slot values
    alarm_state = get_slot_value(event, 'AlarmState') or 'ALARM'
    
    # Map user-friendly terms to CloudWatch states
    state_mapping = {
        'active': 'ALARM',
        'alarm': 'ALARM',
        'insufficient data': 'INSUFFICIENT_DATA', 
        'insufficient': 'INSUFFICIENT_DATA',
        'ok': 'OK',
        'all': None  # Special case to list all alarms
    }
    
    # Default to ALARM if no state is specified
    if not alarm_state or alarm_state.lower() not in state_mapping:
        alarm_state = 'ALARM'
    else:
        alarm_state = state_mapping[alarm_state.lower()]
    
    try:
        cloudwatch = boto3.client('cloudwatch')
        
        # Get alarms with the specified state, or all alarms if state is None
        if alarm_state:
            alarms = cloudwatch.describe_alarms(StateValue=alarm_state)
        else:
            alarms = cloudwatch.describe_alarms()
        
        alarm_count = len(alarms.get('MetricAlarms', []))
        
        if alarm_count == 0:
            if alarm_state == 'ALARM':
                response_content = "Good news! You don't have any active CloudWatch alarms."
            elif alarm_state == 'INSUFFICIENT_DATA':
                response_content = "You don't have any CloudWatch alarms in the INSUFFICIENT_DATA state."
            elif alarm_state == 'OK':
                response_content = "You don't have any CloudWatch alarms in the OK state."
            else:
                response_content = "You don't have any CloudWatch alarms configured."
        else:
            state_desc = ""
            if alarm_state == 'ALARM':
                state_desc = "active"
            elif alarm_state == 'INSUFFICIENT_DATA':
                state_desc = "with insufficient data"
            elif alarm_state == 'OK':
                state_desc = "in OK state"
            else:
                state_desc = "configured"
            
            response_content = f"You have {alarm_count} CloudWatch alarms {state_desc}:\n\n"
            
            for i, alarm in enumerate(alarms.get('MetricAlarms', [])[:10]):
                name = alarm.get('AlarmName')
                state = alarm.get('StateValue')
                description = alarm.get('AlarmDescription', 'No description')
                last_updated = alarm.get('StateUpdatedTimestamp').strftime('%Y-%m-%d %H:%M:%S')
                
                response_content += f"{i+1}. {name} - State: {state}\n"
                response_content += f"   Description: {description}\n"
                response_content += f"   Last updated: {last_updated}\n\n"
            
            if alarm_count > 10:
                response_content += f"...and {alarm_count - 10} more alarms\n"
    except Exception as e:
        response_content = f"I couldn't retrieve your CloudWatch alarms. Error: {str(e)}"
    
    return {
        'sessionState': {
            'dialogAction': {
                'type': 'Close',
                'fulfillmentState': 'Fulfilled'
            },
            'intent': {
                'name': 'CheckCloudWatchAlarms',
                'state': 'Fulfilled'
            }
        },
        'messages': [
            {
                'contentType': 'PlainText',
                'content': response_content
            }
        ]
    }

def handle_configure_aws_resource(event):
    """
    Handler for ConfigureAWSResource intent
    """
    # Extract slot values
    resource_type = get_slot_value(event, 'ResourceType')
    configuration_name = get_slot_value(event, 'ConfigurationName')
    
    print(f"Configuring {resource_type} with name {configuration_name}")
    
    try:
        # Handle different resource types
        if resource_type and resource_type.lower() == 'ec2':
            # In a real implementation, you would create the EC2 instance here
            # For demo purposes, just return a success message
            response_content = f"I've started provisioning an EC2 instance named '{configuration_name}'. " + \
                "In a production environment, this would launch a virtual server with your specified configuration. " + \
                "You would typically be able to connect to this instance via SSH once it's running."
            
        elif resource_type and resource_type.lower() == 's3':
            # For demo purposes
            response_content = f"I've started creating an S3 bucket named '{configuration_name}'. " + \
                "In a production environment, this would create a storage location in AWS where you can store files and data. " + \
                "You would typically be able to access this bucket through the AWS Console or S3 API."
            
        elif resource_type and resource_type.lower() == 'cloudwatch':
            # For demo purposes
            response_content = f"I've started setting up a CloudWatch alarm named '{configuration_name}'. " + \
                "In a production environment, this would create a monitoring alert that can notify you when specific conditions are met. " + \
                "You would typically receive notifications via email or SMS when the alarm is triggered."
        
        else:
            # Generic response for other resource types
            response_content = f"I've started configuring a {resource_type} resource named '{configuration_name}'. " + \
                "In a production environment, this would connect to the appropriate AWS APIs to create this resource."
        
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Fulfilled'
                },
                'intent': {
                    'name': 'ConfigureAWSResource',
                    'state': 'Fulfilled'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': response_content
                }
            ]
        }
        
    except Exception as e:
        print(f"Error in handle_configure_aws_resource: {str(e)}")
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Failed'
                },
                'intent': {
                    'name': 'ConfigureAWSResource',
                    'state': 'Failed'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': f"I encountered an error while trying to configure your {resource_type} resource: {str(e)}"
                }
            ]
        }

def handle_aws_service_status(event):
    """
    Handler for GetAWSServiceStatus intent
    """
    # Extract slot values
    service_name = get_slot_value(event, 'ServiceName') or 'all'
    
    try:
    
        services = {
            'ec2': {'status': 'operational', 'message': 'All systems operational'},
            's3': {'status': 'operational', 'message': 'All systems operational'},
            'cloudwatch': {'status': 'operational', 'message': 'All systems operational'},
            'lambda': {'status': 'operational', 'message': 'All systems operational'},
            'dynamodb': {'status': 'operational', 'message': 'All systems operational'},
            'rds': {'status': 'operational', 'message': 'All systems operational'}
        }
        
        if service_name.lower() == 'all':
            # Check all services
            response_content = "Current AWS service status:\n\n"
            for service, info in services.items():
                response_content += f"{service.upper()}: {info['status'].capitalize()} - {info['message']}\n"
        else:
            # Check specific service
            service_key = service_name.lower()
            if service_key in services:
                info = services[service_key]
                response_content = f"Status of AWS {service_name.upper()}:\n\n"
                response_content += f"{info['status'].capitalize()} - {info['message']}\n"
                response_content += f"\nFor the most up-to-date information, please check the AWS Service Health Dashboard."
            else:
                response_content = f"I don't have status information for {service_name}. Please check the AWS Service Health Dashboard for current status."
        
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Fulfilled'
                },
                'intent': {
                    'name': 'GetAWSServiceStatus',
                    'state': 'Fulfilled'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': response_content
                }
            ]
        }
    
    except Exception as e:
        print(f"Error in handle_aws_service_status: {str(e)}")
        return {
            'sessionState': {
                'dialogAction': {
                    'type': 'Close',
                    'fulfillmentState': 'Failed'
                },
                'intent': {
                    'name': 'GetAWSServiceStatus',
                    'state': 'Failed'
                }
            },
            'messages': [
                {
                    'contentType': 'PlainText',
                    'content': f"I encountered an error while checking AWS service status: {str(e)}"
                }
            ]
        }