Template.analytics.rendered = function() {
    if (!(window._gaq != null)) {
        window._gaq = [];
        _gaq.push(['_setAccount', 'UA-30140976-1']);
        _gaq.push(['_trackPageview']);
        return (function() {
            var ga, gajs, s;
            ga = document.createElement('script');
            ga.type = 'text/javascript';
            ga.async = true;
            gajs = '.google-analytics.com/ga.js';
            ga.src = 'https:' === document.location.protocol ? 'https://ssl' + gajs : 'http://www' + gajs;
            s = document.getElementsByTagName('script')[0];
            return s.parentNode.insertBefore(ga, s);
        })();
    }
};