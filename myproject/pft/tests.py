from django.contrib.auth.hashers import check_password, make_password
from django.test import TestCase
from django.urls import reverse

from .models import Balance, User


class RegisterViewTests(TestCase):
	def test_register_creates_user_and_balance(self):
		response = self.client.post(
			reverse('register'),
			{
				'first_name': 'Jane',
				'last_name': 'Doe',
				'email': 'jane@example.com',
				'phone': '1234567890',
				'password': 'StrongPass123',
				'confirm_password': 'StrongPass123',
			},
		)

		self.assertRedirects(response, reverse('login'))
		user = User.objects.get(email='jane@example.com')
		self.assertEqual(user.first_name, 'Jane')
		self.assertTrue(check_password('StrongPass123', user.password))
		self.assertTrue(Balance.objects.filter(user=user, total_amount=0).exists())

	def test_register_rejects_password_mismatch(self):
		response = self.client.post(
			reverse('register'),
			{
				'first_name': 'Jane',
				'last_name': 'Doe',
				'email': 'jane@example.com',
				'phone': '1234567890',
				'password': 'StrongPass123',
				'confirm_password': 'WrongPass123',
			},
		)

		self.assertEqual(response.status_code, 400)
		self.assertFalse(User.objects.filter(email='jane@example.com').exists())


class LoginViewTests(TestCase):
	def setUp(self):
		self.user = User.objects.create(
			first_name='Jane',
			last_name='Doe',
			email='jane@example.com',
			phone='1234567890',
			password=make_password('StrongPass123'),
		)

	def test_login_sets_session_and_redirects(self):
		response = self.client.post(
			reverse('login'),
			{
				'email': 'jane@example.com',
				'password': 'StrongPass123',
			},
		)

		self.assertRedirects(response, reverse('dashboard'))
		self.assertEqual(self.client.session['user_id'], self.user.id)
		self.assertEqual(self.client.session['user_email'], 'jane@example.com')

	def test_login_rejects_invalid_password(self):
		response = self.client.post(
			reverse('login'),
			{
				'email': 'jane@example.com',
				'password': 'WrongPass123',
			},
		)

		self.assertEqual(response.status_code, 400)
		self.assertNotIn('user_id', self.client.session)
