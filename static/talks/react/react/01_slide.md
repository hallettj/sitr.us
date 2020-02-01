!SLIDE
# React and the Virtual DOM #
## talk at PDXjs ##
### 2014-08-27 ###
### Jesse Hallett \<jesse@sitr.us\> ###

!SLIDE

    @@@ javascript
    var a = React.DOM.a, span = React.DOM.span;

    var LikeButton = React.createClass({
        render: function() {
            return (
                span({ 'class': 'control' },
                    a({
                        href: '#',
                        'class': 'button like'
                    }, 'like')
                )
            );
        }
    });

!SLIDE

    @@@ javascript
    /** @jsx React.DOM **/

    var LikeButton = React.createClass({
        render: function() {
            return (
                <span class="control">
                    <a href="#" class="button like">
                        like
                    </a>
                </span>
            );
        }
    });

!SLIDE

    @@@ javascript
    /** @jsx React.DOM **/

    var LikeButton = React.createClass({
        render: function() {
            var id = this.props.contentId;
            return (
                <span class="control">
                    <a href="#" class="button like"
                                data-content-id={id}>
                        like
                    </a>
                </span>
            );
        }
    });

!SLIDE

    @@@ javascript
    React.renderComponent(
        <LikeButton contentId={whatever.id} />,
        document.getElementById('widgets')
    );

!SLIDE

    @@@ javascript
    var LikeCount = React.createClass({
        propTypes: {
            count: React.PropTypes.number
        },
        getDefaultProps: function() {
            return { count: 0 };
        },
        render: function() {
            var count = this.props.count;
            return (
                <span class="count">{count}</span>
            )
        }
    });

!SLIDE

    @@@ javascript
    var Article = React.createClass({
        render: function() {
            var id = this.props.id
              , likes = this.props.likes;
            <article>
                {this.props.content}
                <footer>
                    <LikeButton contentId={id} />
                    <LikeCount count={likes} />
                </footer>
            </article>
        }
    });

!SLIDE

    @@@ javascript
    function showArticle(article, parentElement) {
        React.renderComponent(
            <Article id={article.id}
                     content={article.content}
                     likes={article.likes} />,
            parentElement
        );
    }

!SLIDE

    @@@ javascript
    var Content = React.createClass({
        getInitialState: function() {
            return { likes: 0 };
        },
        render: function() {
            return this.transferPropsTo(
                <Article likes={this.state.likes} />
            );
        }
    });

!SLIDE

    @@@ javascript
    var content = React.renderComponent(
        <Content id={article.id}
                 content={article.content} />,
        document.getElementById('main');
    );

!SLIDE

    @@@ javascript
    function updateLikeCount() {
        $.getJSON('/articles/'+article.id).
        then(function(article) {
            content.setState({
                likes: article.likes
            });
        });
    }
    setInterval(updateLikeCount, 5000);

!SLIDE

    @@@ javascript
    var LikeButton = React.createClass({
        handleClick: function(event) {
            // What to do?
        },
        render: function() {
            return (
                <span class="control">
                    <a href="#" class="button like"
                                onClick={handleClick}>
                        like
                    </a>
                </span>
            );
        }
    });

!SLIDE center

<img src="flux-react-mvc.png" alt="schematic diagram of MVC" style="width:80%"/>

!SLIDE center

<img src="flux-react.png" alt="schematic diagram of Flux" style="width:80%"/>

!SLIDE

    @@@ javascript
    var LikeButton = React.createClass({
        handleClick: function(event) {
            dispatcher.incrementLike(
                this.props.contentId
            );
        },
        render: function() {
            return (
                <span class="control">
                    <a href="#" class="button like"
                                onClick={handleClick}>
                        like
                    </a>
                </span>
            );
        }
    });

!SLIDE

    @@@ javascript
    function updateLikeCount() {
        $.getJSON('/articles/'+article.id).
        then(function(article) {
            dispatcher.setLikeCount(
                article.id, article.likes
            );
        });
    }
    setInterval(updateLikeCount, 5000);

!SLIDE center small

<img src="virtual-dom-perf.png" alt="Benchmarks comparison Javascript frameworks" style="width:80%"/>

http://elm-lang.org/blog/Blazing-Fast-Html.elm

