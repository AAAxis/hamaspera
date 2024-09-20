from rest_framework import serializers
from .models import Slot

class SlotSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='service.name', read_only=True)
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    color = serializers.SerializerMethodField()

    class Meta:
        model = Slot
        fields = ['id', 'title', 'start', 'end', 'color']

    def get_start(self, obj):
        from datetime import datetime
        return datetime.combine(obj.date, obj.time).isoformat()

    def get_end(self, obj):
        from datetime import datetime, timedelta
        end_time = (datetime.combine(obj.date, obj.time) + timedelta(minutes=30)).time()  # Assuming 30-minute slots
        return datetime.combine(obj.date, end_time).isoformat()

    def get_color(self, obj):
        return "green" if obj.is_available else "red"
