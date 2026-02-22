import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useForm, type SubmitHandler } from "react-hook-form";
// ✨ Swap yupResolver for zodResolver
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import {
  Calendar as CalendarIcon,
  User,
  Mail,
  Phone,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Calendar from "react-calendar";
import { format, parse } from "date-fns";
import { isPastDate } from "@/lib/utils";
import { bookingsAPI } from "@/api/booking";
import { useCMSServices } from "@/lib/cmsSelectors";

// ✨ Import Zod schema, types, and constants
import {
  bookingSchema,
  type BookingFormData,
  defaultTimeSlots,
} from "@/types/bookings/bookings";

export function Booking() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const services = useCMSServices();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BookingFormData>({
    // ✨ Use zodResolver here
    resolver: zodResolver(bookingSchema),
  });

  const selectedTime = watch("time");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeStartDate, setActiveStartDate] = useState<Date>(new Date());

  // ... rest of your component logic remains exactly the same ...
