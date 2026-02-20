from apps.cms.settings import GiftSettings, SerenitySettings


def test_serenity_settings_str():
    s = SerenitySettings(brand="Zen Spa")
    assert str(s) == "SerenitySettings (Zen Spa)"


def test_serenity_settings_str_default_brand():
    s = SerenitySettings()
    assert str(s) == "SerenitySettings (Serenity)"


def test_gift_settings_str_enabled():
    g = GiftSettings(is_enabled=True)
    assert str(g) == "GiftSettings (enabled)"


def test_gift_settings_str_disabled():
    g = GiftSettings(is_enabled=False)
    assert str(g) == "GiftSettings (disabled)"
