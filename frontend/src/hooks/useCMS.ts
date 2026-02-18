import { useQuery, useMutation } from '@tanstack/react-query';
import { cmsAPI } from '@/api/cms';
import toast from 'react-hot-toast';

// --- QUERIES (Reading Data) ---

export const useHomePage = () =>
    useQuery({
        queryKey: ['homepage'],
        queryFn: cmsAPI.getHomePage,
        staleTime: 5 * 60 * 1000,
    });

export const useServices = () =>
    useQuery({
        queryKey: ['services'],
        queryFn: cmsAPI.getServices,
        staleTime: 10 * 60 * 1000,
    });

export const useTestimonials = (minRating?: number) =>
    useQuery({
        queryKey: ['testimonials', minRating],
        queryFn: () => cmsAPI.getTestimonials(minRating),
    });

// --- MUTATIONS (Writing Data) ---

export const useSubmitContact = () =>
    useMutation({
        mutationFn: cmsAPI.submitContact,
        onSuccess: () => toast.success("Message sent! We'll be in touch soon."),
        onError: () => toast.error('Something went wrong. Please try again.'),
    });
