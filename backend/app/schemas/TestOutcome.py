import enum

class TestOutcome(enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NORMAL = "normal"
    ABNORMAL = "abnormal"
    INCONCLUSIVE = "inconclusive"