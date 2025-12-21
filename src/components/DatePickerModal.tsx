import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  title?: string;
  minimumDate?: Date; // Thêm prop này để chặn chọn ngày quá khứ
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  title = 'Select Date',
  minimumDate = new Date(), // Mặc định chặn ngày quá khứ
}) => {
  // SỬA: Khởi tạo với selectedDate hoặc ngày hiện tại
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | null>(selectedDate || null);

  // SỬA: Cập nhật state khi props thay đổi hoặc modal mở lại
  useEffect(() => {
    if (visible) {
        if (selectedDate) {
            setTempSelectedDate(selectedDate);
            setCurrentMonth(new Date(selectedDate)); // Nhảy tới tháng của ngày đã chọn
        } else {
            const now = new Date();
            setTempSelectedDate(now);
            setCurrentMonth(now);
        }
    }
  }, [visible, selectedDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevMonth = new Date(year, month - 1, 0);
      const prevDay = prevMonth.getDate() - (startDayOfWeek - 1 - i);
      days.push({
        day: prevDay,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevDay),
      });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
      });
    }

    // Add empty cells for days after the last day of the month
    const totalCells = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < totalCells; i++) {
      const nextDay: number = i - days.length + 1;
      days.push({
        day: nextDay,
        isCurrentMonth: false,
        date: new Date(year, month + 1, nextDay),
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isDateSelected = (date: Date) => {
    if (!tempSelectedDate) return false;
    return (
      date.getDate() === tempSelectedDate.getDate() &&
      date.getMonth() === tempSelectedDate.getMonth() &&
      date.getFullYear() === tempSelectedDate.getFullYear()
    );
  };

  // Helper để disable ngày quá khứ
  const isDateDisabled = (date: Date) => {
      if (!minimumDate) return false;
      const dateToCheck = new Date(date);
      dateToCheck.setHours(23, 59, 59, 999); // Cho phép chọn ngày hôm nay
      const minDate = new Date(minimumDate);
      minDate.setHours(0, 0, 0, 0);
      return dateToCheck < minDate;
  };

  const handleDatePress = (date: Date, isCurrentMonth: boolean) => {
    if (isCurrentMonth && !isDateDisabled(date)) {
      setTempSelectedDate(date);
    }
  };

  const handleApply = () => {
    if (tempSelectedDate) {
      onDateSelect(tempSelectedDate);
    }
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedDate(selectedDate || null);
    onClose();
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <View style={styles.modal}>
            {/* Header */}
            <Text style={styles.title}>{title}</Text>

            {/* Month Navigation */}
            <View style={styles.monthHeader}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('prev')}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
              
              <Text style={styles.monthYear}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </Text>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => navigateMonth('next')}
              >
                <Ionicons name="chevron-forward" size={20} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeadersContainer}>
              {dayNames.map((dayName) => (
                <Text key={dayName} style={styles.dayHeader}>
                  {dayName}
                </Text>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {days.map((dayInfo, index) => {
                const disabled = !dayInfo.isCurrentMonth || isDateDisabled(dayInfo.date);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dayCell,
                      !dayInfo.isCurrentMonth && styles.inactiveDay,
                      disabled && styles.disabledDay,
                      isDateSelected(dayInfo.date) && styles.selectedDay,
                    ]}
                    onPress={() => handleDatePress(dayInfo.date, dayInfo.isCurrentMonth)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !dayInfo.isCurrentMonth && styles.inactiveDayText,
                        disabled && styles.disabledDayText,
                        isDateSelected(dayInfo.date) && styles.selectedDayText,
                      ]}
                    >
                      {dayInfo.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.lg,
    margin: SIZES.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthYear: {
    fontSize: SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  dayHeadersContainer: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text.secondary,
    paddingVertical: SIZES.spacing.sm,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.spacing.xl,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  selectedDay: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  inactiveDay: {
    opacity: 0, // Ẩn ngày tháng khác (tuỳ chọn)
  },
  disabledDay: {
      opacity: 0.3
  },
  dayText: {
    fontSize: SIZES.sm,
    color: COLORS.text.primary,
  },
  selectedDayText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  inactiveDayText: {
    color: COLORS.text.disabled,
  },
  disabledDayText: {
      color: COLORS.text.disabled,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SIZES.spacing.md,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
  },
  applyButtonText: {
    fontSize: SIZES.md,
    color: COLORS.surface,
    fontWeight: '600',
  },
});

export default DatePickerModal;