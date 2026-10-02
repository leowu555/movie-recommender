from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase

from config.environ import (
    DEFAULT_ALLOWED_HOSTS,
    DEFAULT_CORS_ALLOWED_ORIGINS,
    load_local_env,
    parse_allowed_hosts,
    parse_cors_allowed_origins,
    parse_csrf_trusted_origins,
    parse_debug,
    require_secret_key,
)


class RequireSecretKeyTests(SimpleTestCase):
    def test_missing_secret_key_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            require_secret_key(env={})
        self.assertIn('SECRET_KEY is not set', str(ctx.exception))

    def test_blank_secret_key_raises(self):
        with self.assertRaises(ImproperlyConfigured):
            require_secret_key(env={'SECRET_KEY': '   '})

    def test_nonempty_secret_key_is_returned(self):
        self.assertEqual(require_secret_key(env={'SECRET_KEY': 'local-dev-key'}), 'local-dev-key')


class ParseDebugTests(SimpleTestCase):
    def test_omitted_defaults_to_false(self):
        self.assertIs(parse_debug(env={}), False)

    def test_true_values(self):
        for value in ('1', 'true', 'TRUE', 'yes', 'On'):
            with self.subTest(value=value):
                self.assertIs(parse_debug(env={'DEBUG': value}), True)

    def test_false_values(self):
        for value in ('0', 'false', 'FALSE', 'no', 'Off'):
            with self.subTest(value=value):
                self.assertIs(parse_debug(env={'DEBUG': value}), False)

    def test_invalid_value_raises(self):
        with self.assertRaises(ImproperlyConfigured) as ctx:
            parse_debug(env={'DEBUG': 'maybe'})
        self.assertIn('invalid', str(ctx.exception))

    def test_empty_value_raises(self):
        with self.assertRaises(ImproperlyConfigured):
            parse_debug(env={'DEBUG': '  '})


class ParseHostTests(SimpleTestCase):
    def test_omitted_allowed_hosts_uses_localhost_defaults(self):
        self.assertEqual(parse_allowed_hosts(env={}), DEFAULT_ALLOWED_HOSTS)

    def test_allowed_hosts_are_split_and_stripped(self):
        self.assertEqual(
            parse_allowed_hosts(env={'ALLOWED_HOSTS': 'localhost, 127.0.0.1, example.test'}),
            ['localhost', '127.0.0.1', 'example.test'],
        )

    def test_empty_allowed_hosts_raises(self):
        with self.assertRaises(ImproperlyConfigured):
            parse_allowed_hosts(env={'ALLOWED_HOSTS': '  '})

    def test_omitted_cors_uses_local_vite_defaults(self):
        self.assertEqual(parse_cors_allowed_origins(env={}), DEFAULT_CORS_ALLOWED_ORIGINS)

    def test_cors_origins_are_split(self):
        self.assertEqual(
            parse_cors_allowed_origins(env={'CORS_ALLOWED_ORIGINS': 'http://localhost:5173'}),
            ['http://localhost:5173'],
        )

    def test_csrf_origins_default_empty(self):
        self.assertEqual(parse_csrf_trusted_origins(env={}), [])

    def test_csrf_origins_are_split(self):
        self.assertEqual(
            parse_csrf_trusted_origins(env={'CSRF_TRUSTED_ORIGINS': 'http://localhost:5173'}),
            ['http://localhost:5173'],
        )


class LoadLocalEnvPrecedenceTests(SimpleTestCase):
    def test_existing_environment_is_not_overridden_by_dotenv_file(self):
        import os
        import tempfile
        from pathlib import Path
        from unittest.mock import patch

        with tempfile.TemporaryDirectory() as tmp:
            env_path = Path(tmp) / '.env'
            env_path.write_text('SECRET_KEY=from-file\n', encoding='utf-8')
            with patch.dict(os.environ, {'SECRET_KEY': 'from-process'}, clear=False):
                load_local_env(Path(tmp))
                self.assertEqual(os.environ['SECRET_KEY'], 'from-process')
