import requests

endpoint = "http://127.0.0.1:8000/api/"
endpoint2 = "http://127.0.0.1:8000/products/2"
endpoint3 = "http://127.0.0.1:8000/products/"
endpoint4 = "http://127.0.0.1:8000/products/all/"
# response = requests.post(endpoint2,json={"title":"Mikes shoe"})
response = requests.get(endpoint2)
response_post = requests.post(endpoint3,json={"title":"New new shoes","price":200})
response_all = requests.get(endpoint3)
print (response.status_code)
# print(response.json())
# print(response_post.json())
print(response_all.json())