import jwt
import datetime
from jwt import ExpiredSignatureError, InvalidTokenError
from app.lib.constants import SECRET

class JWT:
    def __init__(self):
        self.secret_key=SECRET

    def generate_token(self,email,time):
        expiration_time = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=time)

        payload = {
            "email":email,
            "exp":expiration_time
        }

        encoded_jwt = jwt.encode(payload, self.secret_key, algorithm="HS256")

        return encoded_jwt
    
    def decode_token(self, token: str):
        try:
            decoded = jwt.decode(token, self.secret_key, algorithms=["HS256"])
            return decoded
        except ExpiredSignatureError as e:
            return e
        except InvalidTokenError as e:
            raise e